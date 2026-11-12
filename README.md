# Glassbox

### Open-source Solana Transparency & Accountability Toolkit

Glassbox is an independent, open-source project designed to make Solana blockchain activity easier to inspect, understand, and verify.

## Our Mission

To make blockchain transparency accessible through clear, verifiable information and public accountability tools.

## Public-good funding request

Glassbox is seeking **$45,000 in non-dilutive public-good grant support over six months**. The request is separate from contributions received: funding received is reported independently through the public on-chain funding panel and downloadable reports.

| Grant milestone | Requested amount |
| --- | ---: |
| RPC reliability, dedicated providers and caching | $10,000 |
| Community proposal registry | $7,500 |
| Security review and remediation | $7,500 |
| Pilot adoption with five Solana projects | $10,000 |
| Adoption reporting and six-month maintenance runway | $10,000 |
| **Total** | **$45,000** |


## Features

- **Wallet inspection** — balance, SPL token holdings and recent activity for any Solana wallet, read live from the blockchain.
- **Transaction verification** — confirmation status, fee, slot, per-account SOL movements and per-mint token movements for any transaction.
- **Token transparency** — every SPL token account (mint, decimals, balance) held by a wallet.
- **Public funding transparency** — a live on-chain summary of a public funding wallet: total received, total spent and current balance, with per-transaction records.
- **Downloadable reports** — one-click JSON wallet reports and CSV funding reports straight from the live blockchain data.
- **Milestone & proposal tracking** — published through versioned JSON data files in this repository, so every change is auditable in git history.
- **Funding demo** — a clearly labelled simulated funding walkthrough at [`/demo`](https://glassbox-opensource.vercel.app/demo), showing the report format without touching live data.

## Technology

- Next.js (App Router)
- React
- TypeScript
- Solana Web3.js
- Vitest

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

### Configuration

Copy `.env.example` to `.env.local` and adjust:

| Variable | Purpose |
| --- | --- |
| `SOLANA_RPC_URL` | JSON-RPC endpoint used for all chain reads. The public `https://api.mainnet-beta.solana.com` endpoint is heavily rate-limited; a dedicated RPC provider (Helius, QuickNode, Alchemy, …) is recommended for real use. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Display hint for which cluster is inspected. |
| `GLASSBOX_FUNDING_WALLET` | Public wallet address whose on-chain funding activity is summarized at `/api/funding`. Leave empty to disable the funding page. |

Glassbox never requests private keys or seed phrases and performs read-only blockchain access.

### Publishing milestones & proposals

Milestones and community proposals are published as versioned JSON records, so every change is auditable in git history. The public proposal page currently accepts submissions as GitHub issues and displays public discussion and review status. This is not yet a pull-request-based proposal workflow, and submissions are not automatically added to `data/proposals.json`. Maintainers can update the versioned milestone and proposal records through pull requests to `data/milestones.json` or `data/proposals.json`:

```json
{
  "milestones": [
    {
      "title": "Milestone 1: wallet inspection",
      "description": "Shipped balance and token views.",
      "status": "complete"
    }
  ]
}
```

`title` is required; `description`, `status` and `dueDate` are optional. A completed milestone may carry a `dueDate` in `YYYY-MM` format, reflecting the month of its implementation commit in git history. Planned milestones may carry an explicitly approved target month; that date is a target, not evidence of completion. The dashboard displays the published status and schedule. The dashboard reads these files live, and unit tests guard the record schema.

## Verification methodology

See the public [Verification & Methodology page](https://glassbox-opensource.vercel.app/methodology) for data sources, verification approach, funding-report definitions, limitations and the project audit trail.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/wallet/{address}` | Balance, SPL token holdings and recent transactions for a wallet. |
| `GET /api/transaction/{signature}` | Full parsed transaction: status, fee, SOL and token movements. |
| `GET /api/tokens/{address}` | SPL token holdings of a wallet (up to 500 accounts). |
| `GET /api/funding` | On-chain funding summary for `GLASSBOX_FUNDING_WALLET`. |
| `GET /api/reports/wallet/{address}` | Downloadable JSON wallet report (balance, tokens, recent transactions). |
| `GET /api/reports/funding` | Downloadable CSV funding report for `GLASSBOX_FUNDING_WALLET`. |
| `GET /api/milestones` | Published project milestones (from `data/milestones.json`). |
| `GET /api/proposals` | Published community proposals (from `data/proposals.json`). |

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run typecheck  # TypeScript, strict mode
npm test           # unit tests (Vitest)
npm run lint       # Next.js lint
```

## Testing

Unit tests cover the pure core logic (address/signature validation, token balance change summarization, funding summaries and CSV report rendering) in `tests/`. GitHub Actions runs type checking, tests and the production build on every push and pull request.

## Security

Glassbox will never ask users for private keys or wallet seed phrases. Only public blockchain information is used. See [SECURITY.md](SECURITY.md) for reporting guidelines.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. In short: fork the repository, create a feature branch, run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` locally, then open a pull request against `main`. GitHub Actions verifies every pull request.

## Project Status

**Completed capabilities:**

- **Wallet inspection** — balance, SPL token holdings and recent activity for any Solana wallet, read live from the blockchain.
- **Transaction verification** — confirmation status, fee, slot, per-account SOL movements and per-mint token movements.
- **Token transparency** — every SPL token account (mint, decimals, balance) held by a wallet.
- **Public funding transparency** — live on-chain funding wallet summary with per-transaction records.
- **Downloadable reports** — one-click JSON wallet reports and CSV funding reports.
- **Milestone & proposal tracking** — published through versioned JSON data files and rendered on the dashboard.
- **Funding demo** — a simulated-data walkthrough page at `/demo`, clearly separated from live wallet data.

**In progress:**

- **Community proposal registry** — the public submission page, GitHub issue creation flow, and public discussion/review display are live. Pull-request-based submission and automatic inclusion in the versioned proposal registry are not implemented yet.

**Planned development (not yet implemented):**

- **RPC reliability** — dedicated RPC provider support and response caching to shield the dashboard from public endpoint rate limits are not implemented yet.

The authoritative, versioned roadmap lives in [data/milestones.json](data/milestones.json), rendered live on the dashboard's Milestones section.

## License

Glassbox is released under the [MIT License](LICENSE).
