# whatsapp-money

Automatically sends ETH (or any EVM native token) from your self-custody wallet to a friend's wallet each day they reply to you on WhatsApp.

## How it works

1. Runs as a Node.js process on your machine.
2. Connects to WhatsApp Web via a QR code scan (one-time).
3. Listens for incoming messages from your configured friend.
4. On the **first message received each calendar day**, sends a set ETH amount to their wallet.
5. Skips all subsequent messages that day — maximum one transfer per day.

## Requirements

- Node.js 18+
- A self-custody wallet (MetaMask or any wallet where you hold the private key)
- Enough ETH (or native token) in that wallet to cover transfers + gas
- An Ethereum RPC URL — free tier from [Infura](https://infura.io) or [Alchemy](https://alchemy.com) works fine
- Your friend's wallet address and WhatsApp phone number

## Setup

```bash
git clone https://github.com/naviyaissocodelike/whatsapp-money.git
cd whatsapp-money
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Your wallet private key (no `0x` prefix) |
| `FRIEND_WALLET_ADDRESS` | Your friend's `0x...` Ethereum address |
| `FRIEND_PHONE` | Their WhatsApp number with country code, digits only (e.g. `447911123456`) |
| `TRANSFER_AMOUNT_ETH` | Amount to send each day (e.g. `0.001`) |
| `RPC_URL` | Your RPC endpoint |

## Running

```bash
npm start
```

The first time you run it a QR code will appear. Open WhatsApp on your phone → **Settings → Linked Devices → Link a Device** and scan it. The session is saved locally so you only need to do this once.

After that the bot runs silently. Each transfer is logged to `data/transfers.json`.

## Supported networks

Set `RPC_URL` to any EVM-compatible network:

| Network | RPC URL |
|---|---|
| Ethereum | `https://mainnet.infura.io/v3/<key>` |
| Polygon (low fees) | `https://polygon-rpc.com` |
| Base | `https://mainnet.base.org` |
| Arbitrum | `https://arb1.arbitrum.io/rpc` |

## Transfer log

`data/transfers.json` keeps the last 365 records:

```json
{
  "lastTransferDate": "2024-01-15",
  "totalTransfers": 3,
  "history": [
    {
      "date": "2024-01-15",
      "timestamp": "2024-01-15T09:23:11.000Z",
      "txHash": "0xabc...",
      "amount": "0.001",
      "to": "0xFriend..."
    }
  ]
}
```

## Security

- **Your private key controls your funds.** Keep `.env` secure and never commit it (it is in `.gitignore`).
- Use a dedicated wallet funded with only as much as you're comfortable automating.
- Run this on a machine you own and control — not a shared server.
- The `.wwebjs_auth/` directory contains your WhatsApp session token; treat it like a password.
