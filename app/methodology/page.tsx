import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification & Methodology",
  description: "How Glassbox reads, presents and limits public Solana blockchain data, funding summaries and project records.",
};

export default function MethodologyPage() {
  return (
    <main className="container">
      <header>
        <h1>Verification &amp; Methodology</h1>
        <p className="muted">How Glassbox sources, checks and presents public information.</p>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/#wallet">Wallet inspection</a>
          <a href="/#transaction">Transaction verification</a>
          <a href="/#funding">Funding transparency</a>
          <a href="/#milestones">Milestones</a>
        </nav>
      </header>
      <section className="card">
        <h2>1. Data sources</h2>
        <p>Glassbox reads publicly available Solana blockchain data through a configured Solana JSON-RPC endpoint. Wallet balances, token accounts, transaction details and funding-wallet activity are requested when a visitor uses the relevant dashboard feature.</p>
        <p>The application does not request private keys, seed phrases or wallet signing permissions. It is a read-only inspection tool.</p>
      </section>
      <section className="card">
        <h2>2. Wallet inspection</h2>
        <p>A wallet report presents the address queried, its reported SOL balance, token-account information and a limited set of recent transactions returned by the RPC provider. Token balances are based on account data returned by that provider at query time.</p>
        <p>Results are a point-in-time view. They can change as the blockchain advances, and provider indexing or rate limits may affect availability and completeness.</p>
      </section>
      <section className="card">
        <h2>3. Transaction verification</h2>
        <p>Glassbox requests a transaction by its signature and displays response fields available from the RPC provider, including execution status, slot, fee, SOL balance changes and token balance changes.</p>
        <p>A displayed result is a parsed view of public chain data, not an independent security audit, legal determination or guarantee about the real-world purpose of a transaction.</p>
      </section>
      <section className="card">
        <h2>4. Funding report definitions</h2>
        <ul>
          <li><strong>Received:</strong> incoming SOL transfers identified in transactions analyzed by the funding endpoint.</li>
          <li><strong>Spent:</strong> outgoing SOL activity identified by that endpoint; transaction fees may be reported separately.</li>
          <li><strong>Current balance:</strong> the wallet balance returned at the time the report is generated.</li>
          <li><strong>Transactions analyzed:</strong> the activity count returned by the endpoint, not a count of donations.</li>
          <li><strong>Grant target:</strong> the requested $45,000 in grant support; it is not money received and is not an on-chain fundraising percentage.</li>
        </ul>
        <p>The funding wallet address shown on the live dashboard is the public address being inspected. Visitors can independently open it in Solana Explorer and compare public activity.</p>
      </section>
      <section className="card">
        <h2>5. Project records and audit trail</h2>
        <p>The roadmap and proposal registry are stored as version-controlled data in the public GitHub repository. Changes can be inspected in commit history. Planned dates are targets; a planned milestone is not represented as completed until its status and supporting evidence are updated.</p>
        <p>Public proposal discussions are linked to GitHub Issues. A submission is a request for review, not an approval or a promise of implementation.</p>
        <p><a href="https://github.com/Godwin178/Glassbox" target="_blank" rel="noopener noreferrer">View source repository</a>{" · "}<a href="https://github.com/Godwin178/Glassbox/commits/main/" target="_blank" rel="noopener noreferrer">Review commit history</a>{" · "}<a href="https://github.com/Godwin178/Glassbox/issues" target="_blank" rel="noopener noreferrer">View public discussions</a></p>
      </section>
      <section className="card">
        <h2>6. Limitations</h2>
        <ul>
          <li>RPC providers may impose rate limits, return incomplete history or temporarily become unavailable.</li>
          <li>Token metadata and off-chain claims are not independently authenticated by this dashboard.</li>
          <li>Displaying a public address does not establish wallet ownership or the identity or intent of a transaction sender.</li>
          <li>Funding summaries do not prove that an incoming transfer is a grant, donation or project contribution.</li>
          <li>CSV and JSON exports reflect data returned when requested and may differ from a later report as the chain advances.</li>
        </ul>
      </section>
      <footer className="muted" style={{ marginTop: 40 }}>Glassbox — Transparency. Accountability. Participation.</footer>
    </main>
  );
}
