# OvenBench — Superteam submission

## One-line pitch

**OvenBench turns Cookie Chain's sub-second-finality claim into a live, wallet-signed benchmark with verifiable on-chain receipts.**

## What it does

Connect Nightly, choose 1/3/5 samples, approve the batch, and OvenBench broadcasts real Cookie Chain memo transactions concurrently. It measures broadcast-to-confirmed latency, fetches fee/slot metadata, calculates p50 and p95, and links every sample to Cookiescan.

Signing is completed before timers start, so wallet UX does not contaminate the measurement.

## Why it is useful

Cookie Chain is selling builders on a fast SVM environment. OvenBench gives developers and users a transparent way to test that experience from their own browser and geography instead of relying on a static marketing number. The receipts make every benchmark auditable.

## Links to provide on submission

- Live application: **TBD after final production deploy**
- GitHub: `https://github.com/omeriadon/Tests/tree/cookiechain-ovenbench` during development; migrate to standalone repo before final submission
- Program used: Solana Memo v2 — `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- RPC: `https://rpc.cookiescan.io`

## X thread draft checklist

The bounty requires an X thread and sharing it in the Cookie Chain Telegram. Final thread should include:

1. What OvenBench measures and why signing occurs before timing.
2. Short screen recording: connect Nightly → choose samples → sign → live confirmations.
3. Screenshot of p50/p95 results and Cookiescan receipt links.
4. Explain that each sample is a real on-chain memo transaction and transfers no value.
5. Link the public app and source.
6. Point users who need fee balance to the official Cookie Chain bridge.

Do not publish the thread until the production URL and a successful real benchmark are verified.

## Final verification before submission

- [ ] Production deployment succeeds
- [ ] Nightly detects and connects on Cookie Chain
- [ ] Connected address and balance render
- [ ] A 3-transaction benchmark signs as a batch
- [ ] All three signatures appear on Cookiescan
- [ ] p50/p95 render from real confirmations
- [ ] Failure state tested (reject signature or disconnect)
- [ ] Mobile layout checked
- [ ] Standalone GitHub repository created
- [ ] X demo recorded and thread posted
- [ ] X thread shared in Cookie Chain Telegram
- [ ] Superteam listing submitted
