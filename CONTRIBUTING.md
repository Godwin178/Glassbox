# Contributing to Glassbox

Thank you for your interest in contributing to Glassbox.

## How to Contribute

1. **Fork the repository** on GitHub (or clone it directly if you have write access):

   ```bash
   git clone https://github.com/Godwin178/Glassbox.git
   cd Glassbox
   npm install
   cp .env.example .env.local
   ```

2. **Create a new branch** for your change, named for its purpose:

   ```bash
   git switch -c feature/short-description
   ```

3. **Make your changes.** Keep each pull request focused on one change.

4. **Test your code** before pushing. Run all four checks locally:

   ```bash
   npm run lint       # ESLint (Next.js core-web-vitals)
   npm run typecheck  # TypeScript, strict mode
   npm test           # unit tests (Vitest)
   npm run build      # production build
   ```

5. **Submit a pull request** against `main` with a clear title and description of what changed and why. GitHub Actions runs lint, typecheck, tests and the production build on every pull request, and it must pass before the change can be merged.

## Publishing milestones & proposals

Milestones and community proposals are published as versioned JSON records, so every change is auditable in git history. To publish one, open a pull request adding an entry to `data/milestones.json` or `data/proposals.json` — the schema is documented in the README.

## Contribution Guidelines

- Write clean, readable code.
- Keep changes focused and documented.
- Never include private keys, seed phrases, or secrets.
- Do not publish fabricated blockchain data.
- Validate all user inputs.
- Report security vulnerabilities privately (see [SECURITY.md](SECURITY.md)).

## Project Goal

Glassbox aims to make Solana blockchain activity, funding, expenses, and project milestones easier to inspect and verify.

Thank you for helping build transparent open-source tools.
