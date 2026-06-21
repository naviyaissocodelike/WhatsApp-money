const TelegramBot = require('node-telegram-bot-api');
const { sendUSDC } = require('./transfer');
const { canTransfer, recordTransfer, getStats } = require('./tracker');

const AMOUNT_USDC = '0.01';
const TRIGGER = /not funny/i;

function createТelegramBot(config) {
  const bot = new TelegramBot(config.telegramToken, { polling: true });

  bot.on('polling_error', (err) => console.error('Telegram polling error:', err.message));

  bot.on('message', async (msg) => {
    const senderId = msg.from?.id?.toString();
    const text = msg.text || '';

    if (senderId !== config.friendTelegramId) return;
    if (!TRIGGER.test(text)) return;

    const stats = getStats();
    console.log(`[${new Date().toISOString()}] "${text.slice(0, 80)}" — total bill so far: $${stats.totalSentUSDC}`);

    const { allowed, secondsLeft } = canTransfer(config.cooldownSeconds);
    if (!allowed) {
      console.log(`Cooldown active — ${secondsLeft}s remaining, skipping.`);
      return;
    }

    console.log(`Sending $${AMOUNT_USDC} USDC to ${config.friendWallet}...`);

    try {
      const txHash = await sendUSDC(
        config.privateKey,
        config.friendWallet,
        AMOUNT_USDC,
        config.rpcUrl,
        config.usdcAddress,
      );
      recordTransfer(txHash, AMOUNT_USDC, config.friendWallet, text);
      const updated = getStats();
      console.log(`  Sent! TX: ${txHash}`);
      console.log(`  Running total: $${updated.totalSentUSDC} across ${updated.totalTransfers} "not funny" moments`);
    } catch (err) {
      console.error('Transfer failed:', err.message);
    }
  });

  console.log('Telegram bot is listening...');
  return bot;
}

module.exports = { createТelegramBot };
