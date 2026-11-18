# Glassbox Roadmap

Glassbox is an open-source Solana transparency and accountability toolkit. This roadmap reflects the current published project milestones in `data/milestones.json`. Statuses describe implementation progress; target months are planning estimates, not guarantees.

## Completed

### 1. Wallet inspection
**Status:** Complete · **Recorded:** October 2026

Show live SOL balance, SPL token holdings and recent activity for any Solana wallet.

### 2. Transaction verification
**Status:** Complete · **Recorded:** October 2026

Show transaction confirmation status, fee, slot, per-account SOL movements and per-mint token movements.

### 3. Funding transparency and downloadable reports
**Status:** Complete · **Recorded:** October 2026

Provide an on-chain funding wallet summary and downloadable JSON wallet and CSV funding reports.

### 4. Dashboard refinements
**Status:** Complete · **Recorded:** October 2026

Deliver a mobile-responsive dashboard, funding-wallet explorer link, lint tooling and published milestones.

## In progress

### 5. Community proposal registry
**Status:** In progress · **Current target:** December 2026

The public proposal page accepts submissions as GitHub issues and displays public discussion and review status. Remaining work includes a pull-request-based submission workflow and a reliable process for promoting reviewed proposals into the versioned registry. Automatic inclusion in `data/proposals.json` is not yet implemented.

## Planned

### 6. RPC reliability
**Status:** Planned · **Target:** January 2027

Add dedicated RPC provider support and response caching to reduce the impact of public endpoint rate limits and improve dashboard reliability.

## Pilot adoption and validation

We intend to recruit up to five small Solana projects to test Glassbox's wallet inspection, transaction verification and public funding-report workflows. Pilot participation is not yet confirmed. This roadmap will be updated with named pilots and permissioned feedback only after projects explicitly agree to participate.

## Funding plan

Glassbox is seeking **$15,000 in non-dilutive public-good grant support over six months**.

| Workstream | Planned allocation |
| --- | ---: |
| RPC reliability, dedicated providers and caching | $3,300 |
| Community proposal registry | $2,500 |
| Security review and remediation | $2,500 |
| Pilot adoption with five Solana projects | $3,300 |
| Adoption reporting and six-month maintenance runway | $3,400 |
| **Total** | **$15,000** |

These are proposed allocations, not funds already received or spent. Actual funding receipts and expenditures will be tracked separately through the public funding transparency tools.

## How progress is verified

- Implementation status is maintained in [`data/milestones.json`](data/milestones.json).
- Changes to milestone and proposal records are auditable in Git history.
- Public product capabilities can be tested at the [Glassbox live application](https://glassbox-opensource.vercel.app).
- Simulated funding examples are labelled as demos and are not represented as real contributions.

## Contributing

Feedback, code contributions and pilot interest are welcome through [GitHub](https://github.com/Godwin178/Glassbox). Please do not submit private keys, seed phrases or confidential user information.
