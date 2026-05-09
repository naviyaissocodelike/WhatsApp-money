require('dotenv').config();
const { createWhatsAppClient } = require('./whatsapp');

const REQUIRED_ENV = ['PRIVATE_KEY', 'FRIEND_WALLET_ADDRESS', 'FRIEND_PHONE', 'RPC_URL'];

function validateConfig() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy .env.example to .env and fill in your values.');
    process.exit(1);
  }

  if (!process.env.FRIEND_WALLET_ADDRESS.match(/^0x[0-9a-fA-F]{40}$/)) {
    console.error('FRIEND_WALLET_ADDRESS must be a valid Ethereum address (0x + 40 hex chars).');
    process.exit(1);
  }
}

validateConfig();

const config = {
  privateKey: process.env.PRIVATE_KEY,
  friendWallet: process.env.FRIEND_WALLET_ADDRESS,
  friendPhone: process.env.FRIEND_PHONE,
  transferAmount: parseFloat(process.env.TRANSFER_AMOUNT_ETH || '0.001'),
  rpcUrl: process.env.RPC_URL,
};

console.log('WhatsApp Money Bot starting...');
console.log(`  Transfer amount : ${config.transferAmount} ETH/native token`);
console.log(`  Recipient wallet: ${config.friendWallet}`);
console.log(`  Watching phone  : ${config.friendPhone}`);
console.log();

const client = createWhatsAppClient(config);
client.initialize();
