# OvenBench

OvenBench is a wallet-connected transaction benchmark for [Cookie Chain](https://www.cookiechain.wtf), an SVM-compatible network.

**Live app:** https://tests-git-cookiechain-ovenbench-omeriadons-projects.vercel.app

It measures **broadcast → confirmed latency using real signed transactions**, then links every sample to its Cookiescan receipt. Wallet signing is completed before timing begins so the benchmark measures the browser/RPC/network path rather than user reaction time.

## What it demonstrates

- Nightly wallet connection
- Cookie Chain genesis/network verification before signing
- User-approved Nightly network switching when required
- Connected wallet address and COOK balance
- Real Cookie Chain transactions through `https://rpc.cookiescan.io`
- Explicit confirmation and failure handling
- Per-transaction broadcast and confirmation latency
- Slot and transaction-fee metadata
- p50 / p95 / fastest statistics
- Live network slot, block height, and observed TPS
- Verifiable Cookiescan receipts
- Local benchmark history and shareable summaries

No value is transferred during a benchmark. Each sample invokes Solana's canonical Memo program with an `ovenbench` payload and pays only the normal Cookie Chain transaction fee.

## Network

| Item | Value |
| --- | --- |
| HTTP RPC | `https://rpc.cookiescan.io` |
| WebSocket | `wss://wss.cookiescan.io` |
| Explorer | `https://cookiescan.io` |
| Required wallet | Nightly |
| Memo program | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, connect Nightly, approve a Cookie Chain network switch if prompted, and run a benchmark.

## Benchmark method

1. Fetch one recent blockhash.
2. Build 1, 3, or 5 unique memo transactions with the connected wallet as fee payer.
3. Ask the wallet to sign the full batch **before** starting network timers.
4. Broadcast signed transactions concurrently.
5. Measure each transaction from immediately before `sendRawTransaction` until `confirmed` commitment.
6. Fetch transaction metadata and display fee, slot, and Cookiescan receipt.
7. Calculate p50, p95, and fastest confirmation latency from successful samples.

The measurement includes browser ↔ RPC latency and therefore is not a protocol-level finality guarantee. That limitation is intentional and disclosed in the UI.

## Bounty requirements covered

- [x] Web application on Cookie Chain
- [x] Nightly wallet support
- [x] Cookie Chain network verification / switch guard
- [x] Wallet address display
- [x] On-chain transaction execution
- [x] Transaction confirmation handling
- [x] Error handling and live feedback
- [x] Application-specific activity and benchmark history
- [x] Analytics / dashboard metrics
- [x] Open-source source code with MIT license
- [x] Public Vercel deployment
- [x] Comprehensive setup documentation

## Safety

OvenBench never requests a seed phrase or private key. Transactions are built client-side and sent only after the connected wallet signs them. The benchmark memo contains a random session id, run number, timestamp, app identifier, and version; it does not contain personal data.

## Source

The submission source currently lives on the public `cookiechain-ovenbench` branch of this repository:

https://github.com/omeriadon/Tests/tree/cookiechain-ovenbench

## Submission

Built for the Superteam Earn **Create an App on Cookie Chain** bounty. See `SUBMISSION.md` for the final listing copy and verification checklist.
