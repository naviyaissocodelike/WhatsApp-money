const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { sendETH } = require('./transfer');
const { hasTransferredToday, recordTransfer } = require('./tracker');

// Normalise phone number to WhatsApp contact ID format
function toContactId(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.endsWith('@c.us') ? digits : `${digits}@c.us`;
}

function createWhatsAppClient(config) {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  const friendId = toContactId(config.friendPhone);

  client.on('qr', (qr) => {
    console.log('Scan this QR code with WhatsApp (Linked Devices → Link a Device):');
    console.log();
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('WhatsApp authenticated.');
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
    console.error('Delete the .wwebjs_auth directory and restart to re-scan the QR code.');
    process.exit(1);
  });

  client.on('ready', () => {
    console.log(`WhatsApp ready. Watching for messages from ${friendId}`);
  });

  client.on('disconnected', (reason) => {
    console.warn('WhatsApp disconnected:', reason, '— reinitialising...');
    client.initialize();
  });

  client.on('message', async (message) => {
    // Only act on messages from the configured friend (not group chats)
    if (message.from !== friendId || message.isGroupMsg) return;

    const preview = message.body.slice(0, 60);
    console.log(`[${new Date().toISOString()}] Message from friend: "${preview}"`);

    if (hasTransferredToday()) {
      console.log('Already sent a transfer today — skipping.');
      return;
    }

    console.log(`Sending ${config.transferAmount} ETH to ${config.friendWallet}...`);

    try {
      const txHash = await sendETH(
        config.privateKey,
        config.friendWallet,
        config.transferAmount,
        config.rpcUrl,
      );
      recordTransfer(txHash, config.transferAmount, config.friendWallet);
      console.log(`Transfer complete. TX: ${txHash}`);
    } catch (err) {
      console.error('Transfer failed:', err.message);
    }
  });

  return client;
}

module.exports = { createWhatsAppClient };
