# NOT FUNNY Bot

Sends **$0.01 USDC** from your self-custody wallet to a friend's wallet every time they say "NOT FUNNY" to you on Telegram.

Each utterance of "NOT FUNNY" costs you one cent. Your running bill is logged.

## How it works

1. You create a Telegram bot and add your friend to it (or they DM it).
2. The bot watches for any message from your friend containing "not funny" (case-insensitive).
3. On each match, $0.01 USDC is sent on-chain to their wallet — instantly.
4. A 60-second cooldown prevents spam bursts (configurable).
5. Every transfer and the phrase that triggered it is logged to `data/transfers.json`.

## Setup

### 1. Create a Telegram bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot`, pick a name and username
3. Copy the **bot token** you receive

### 2. Get your friend's Telegram user ID

Have your friend message **@userinfobot** on Telegram — it replies with their numeric user ID.

### 3. Install and configure

```bash
git clone https://github.com/naviyaissocodelike/whatsapp-money.git
cd whatsapp-money
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Your wallet private key (no `0x`) |
| `FRIEND_WALLET_ADDRESS` | Your friend's `0x...` address |
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather |
| `FRIEND_TELEGRAM_ID` | Your friend's numeric Telegram user ID |
| `USDC_CONTRACT_ADDRESS` | USDC address for your network (see below) |
| `RPC_URL` | RPC endpoint for your network |
| `COOLDOWN_SECONDS` | Min seconds between transfers (default: `60`) |

### 4. Fund your wallet

Make sure your wallet has:
- Enough USDC for transfers
- A small amount of native token for gas (MATIC on Polygon, ETH on Ethereum/Base/Arbitrum)

### 5. Run

```bash
npm start
```

No QR codes, no browser — just a running process. Keep it open in a terminal or run it with `pm2`/`screen`.

## Networks and USDC addresses

| Network | USDC address | Gas token |
|---|---|---|
| Polygon (recommended) | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | MATIC (~free) |
| Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | ETH (cheap) |
| Arbitrum | `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8` | ETH (cheap) |
| Ethereum | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | ETH (expensive) |

**Polygon is recommended** — gas is a fraction of a cent, so $0.01 transfers actually make sense.

## Transfer log

`data/transfers.json` keeps a full history:

```json
{
  "totalTransfers": 7,
  "totalSentUSDC": "0.07",
  "lastTransferTime": "2024-01-15T09:23:11.000Z",
  "history": [
    {
      "timestamp": "2024-01-15T09:23:11.000Z",
      "txHash": "0xabc...",
      "amountUSDC": "0.01",
      "to": "0xFriend...",
      "triggerMessage": "bro that joke was NOT FUNNY at all"
    }
  ]
}
```

## Security

- **Never commit `.env`** — it contains your private key (already in `.gitignore`).
- Use a dedicated wallet with only what you're willing to automate.
- Run on a machine you own and control.
