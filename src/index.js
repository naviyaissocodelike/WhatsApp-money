require('dotenv').config();
const { createTelegramBot } = require('./telegram');

const REQUIRED = [
  'PRIVATE_KEY',
  'FRIEND_WALLET_ADDRESS',
  'TELEGRAM_BOT_TOKEN',
  'FRIEND_TELEGRAM_ID',
  'USDC_CONTRACT_ADDRESS',
  'RPC_URL',
];

function validate() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}`);
    console.error('Copy .env.example to .env and fill in your values.');
    process.exit(1);
  }
  if (!process.env.FRIEND_WALLET_ADDRESS.match(/^0x[0-9a-fA-F]{40}$/)) {
    console.error('FRIEND_WALLET_ADDRESS must be a valid 0x Ethereum address.');
    process.exit(1);
  }
}

validate();

const config = {
  privateKey: process.env.PRIVATE_KEY,
  friendWallet: process.env.FRIEND_WALLET_ADDRESS,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  friendTelegramId: process.env.FRIEND_TELEGRAM_ID,
  usdcAddress: process.env.USDC_CONTRACT_ADDRESS,
  rpcUrl: process.env.RPC_URL,
  cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS || '60', 10),
};

console.log('NOT FUNNY Bot starting...');
console.log(`  $0.01 USDC → ${config.friendWallet}`);
console.log(`  Watching Telegram user: ${config.friendTelegramId}`);
console.log(`  Cooldown: ${config.cooldownSeconds}s between transfers`);
console.log();

createТelegramBot(config);
