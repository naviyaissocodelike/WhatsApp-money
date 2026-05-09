const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'transfers.json');

function today() {
  return new Date().toISOString().split('T')[0];
}

function load() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) return { lastTransferDate: null, totalTransfers: 0, history: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function hasTransferredToday() {
  return load().lastTransferDate === today();
}

function recordTransfer(txHash, amount, to) {
  const data = load();
  data.lastTransferDate = today();
  data.totalTransfers += 1;
  data.history.unshift({
    date: today(),
    timestamp: new Date().toISOString(),
    txHash,
    amount: amount.toString(),
    to,
  });
  // Keep a rolling window of the last 365 records
  if (data.history.length > 365) data.history = data.history.slice(0, 365);
  save(data);
}

module.exports = { hasTransferredToday, recordTransfer };
