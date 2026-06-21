const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'transfers.json');

function load() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    return { totalTransfers: 0, totalSentUSDC: '0.00', lastTransferTime: null, history: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function canTransfer(cooldownSeconds) {
  const data = load();
  if (!data.lastTransferTime) return { allowed: true, secondsLeft: 0 };
  const elapsed = (Date.now() - new Date(data.lastTransferTime).getTime()) / 1000;
  const secondsLeft = Math.ceil(cooldownSeconds - elapsed);
  return { allowed: elapsed >= cooldownSeconds, secondsLeft: Math.max(0, secondsLeft) };
}

function recordTransfer(txHash, amountUSDC, to, triggerMessage) {
  const data = load();
  data.lastTransferTime = new Date().toISOString();
  data.totalTransfers += 1;
  data.totalSentUSDC = (parseFloat(data.totalSentUSDC) + parseFloat(amountUSDC)).toFixed(2);
  data.history.unshift({
    timestamp: data.lastTransferTime,
    txHash,
    amountUSDC,
    to,
    triggerMessage: triggerMessage.slice(0, 200),
  });
  if (data.history.length > 1000) data.history = data.history.slice(0, 1000);
  save(data);
}

function getStats() {
  const data = load();
  return { totalTransfers: data.totalTransfers, totalSentUSDC: data.totalSentUSDC };
}

module.exports = { canTransfer, recordTransfer, getStats };
