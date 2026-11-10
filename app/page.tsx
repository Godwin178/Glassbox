"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

const EXPLORER = "https://explorer.solana.com";
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta";

interface TokenHolding {
  account: string;
  mint: string;
  decimals: number | null;
  uiAmount: number | null;
}

interface WalletResult {
  address: string;
  balanceSOL: number;
  tokens: TokenHolding[];
  recentTransactions: {
    signature: string;
    slot: number;
    blockTime: number | null;
    failed: boolean;
  }[];
}

interface TransactionResult {
  signature: string;
  found: boolean;
  message?: string;
  status?: string;
  error?: unknown;
  slot?: number;
  blockTime?: number | null;
  feeSOL?: number;
  feePayer?: string | null;
  balanceChanges?: { address: string; deltaSOL: number }[];
  tokenChanges?: {
    mint: string;
    owner: string | null;
    uiAmountBefore: number;
    uiAmountAfter: number;
    delta: number;
  }[];
}

interface FundingRecord {
  signature: string;
  slot: number;
  timestamp: number | null;
  direction: string;
  amountSOL: number;
  feeSOL: number;
}

interface FundingResult {
  configured: boolean;
  wallet?: string;
  totalReceivedSOL?: number;
  totalSpentSOL?: number;
  balanceSOL?: number;
  transactionsAnalyzed?: number;
  records?: FundingRecord[];
  message?: string;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(value);
}

function formatTimestamp(unixSeconds: number | null): string {
  if (!unixSeconds) {
    return "—";
  }
  return (
    new Date(unixSeconds * 1000).toISOString().replace("T", " ").slice(0, 19) +
    " UTC"
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload?.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

function WalletInspector() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<WalletResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inspect = useCallback(async () => {
    const value = address.trim();

    if (value.length < 32 || value.length > 44) {
      setError("Enter a valid Solana wallet address (32-44 base58 characters).");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setResult(await fetchJson<WalletResult>(`/api/wallet/${value}`));
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [address]);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      inspect();
    },
    [inspect]
  );

  return (
    <section className="card" id="wallet">
      <h2>Inspect a Solana wallet</h2>
      <p className="muted">
        Balance, token holdings and recent activity, read directly from the
        Solana blockchain.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          className="input"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter a public Solana wallet address"
          aria-label="Solana wallet address"
        />
        <p>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Inspecting…" : "Inspect wallet"}
          </button>
        </p>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="muted">Balance</div>
              <div className="stat-value">
                {formatNumber(result.balanceSOL)} SOL
              </div>
            </div>
            <div className="stat">
              <div className="muted">Token accounts</div>
              <div className="stat-value">{result.tokens.length}</div>
            </div>
            <div className="stat">
              <div className="muted">Recent transactions</div>
              <div className="stat-value">
                {result.recentTransactions.length}
              </div>
            </div>
          </div>

          <p>
            <a
              className="button"
              href={`/api/reports/wallet/${result.address}`}
              download
            >
              Download report (JSON)
            </a>
          </p>

          {result.tokens.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token mint</th>
                  <th>Balance</th>
                  <th>Decimals</th>
                </tr>
              </thead>
              <tbody>
                {result.tokens.map((token) => (
                  <tr key={token.account}>
                    <td className="mono">
                      <a
                        href={`${EXPLORER}/address/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {token.mint}
                      </a>
                    </td>
                    <td className="mono">
                      {token.uiAmount === null
                        ? "unavailable"
                        : formatNumber(token.uiAmount)}
                    </td>
                    <td>{token.decimals ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No SPL token accounts found for this wallet.</p>
          )}

          {result.recentTransactions.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Signature</th>
                  <th>Slot</th>
                  <th>Time</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {result.recentTransactions.map((tx) => (
                  <tr key={tx.signature}>
                    <td className="mono">
                      <a
                        href={`${EXPLORER}/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tx.signature.slice(0, 16)}…
                      </a>
                    </td>
                    <td>{tx.slot}</td>
                    <td className="muted">{formatTimestamp(tx.blockTime)}</td>
                    <td className={tx.failed ? "error" : "ok"}>
                      {tx.failed ? "failed" : "successful"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No recent transactions found for this wallet.</p>
          )}
        </>
      ) : null}
    </section>
  );
}

function TransactionVerifier() {
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async () => {
    const value = signature.trim();

    if (value.length < 64 || value.length > 88) {
      setError(
        "Enter a valid transaction signature (64-88 base58 characters)."
      );
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setResult(
        await fetchJson<TransactionResult>(`/api/transaction/${value}`)
      );
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [signature]);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      verify();
    },
    [verify]
  );

  return (
    <section className="card" id="transaction">
      <h2>Verify a transaction</h2>
      <p className="muted">
        Confirmation status, fee, SOL movements and token movements for any
        transaction.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          className="input"
          value={signature}
          onChange={(event) => setSignature(event.target.value)}
          placeholder="Enter a transaction signature"
          aria-label="Transaction signature"
        />
        <p>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify transaction"}
          </button>
        </p>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {result && !result.found ? (
        <p className="muted">{result.message}</p>
      ) : null}

      {result?.found ? (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="muted">Status</div>
              <div
                className={`stat-value ${
                  result.status === "failed" ? "error" : "ok"
                }`}
              >
                {result.status}
              </div>
            </div>
            <div className="stat">
              <div className="muted">Fee</div>
              <div className="stat-value">
                {formatNumber(result.feeSOL ?? 0)} SOL
              </div>
            </div>
            <div className="stat">
              <div className="muted">Slot</div>
              <div className="stat-value">{result.slot}</div>
            </div>
          </div>

          <p className="muted">{formatTimestamp(result.blockTime ?? null)}</p>
          <p className="mono">Fee payer: {result.feePayer ?? "—"}</p>

          {result.status === "failed" && result.error ? (
            <p className="error mono">
              Transaction error: {JSON.stringify(result.error)}
            </p>
          ) : null}

          {result.balanceChanges?.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>SOL change</th>
                </tr>
              </thead>
              <tbody>
                {result.balanceChanges.map((change) => (
                  <tr key={change.address}>
                    <td className="mono">
                      <a
                        href={`${EXPLORER}/address/${change.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {change.address}
                      </a>
                    </td>
                    <td className={change.deltaSOL > 0 ? "ok" : "error"}>
                      {change.deltaSOL > 0 ? "+" : ""}
                      {formatNumber(change.deltaSOL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {result.tokenChanges?.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token mint</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {result.tokenChanges.map((change) => (
                  <tr key={`${change.mint}-${change.owner ?? ""}`}>
                    <td className="mono">{change.mint}</td>
                    <td className="mono">{formatNumber(change.uiAmountBefore)}</td>
                    <td className="mono">{formatNumber(change.uiAmountAfter)}</td>
                    <td className={change.delta > 0 ? "ok" : "error"}>
                      {change.delta > 0 ? "+" : ""}
                      {formatNumber(change.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No token balance changes in this transaction.</p>
          )}

          {result.balanceChanges?.length === 0 &&
          result.tokenChanges?.length === 0 ? (
            <p className="muted">
              No SOL or token balance changes recorded in this transaction.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function FundingPanel() {
  const [funding, setFunding] = useState<FundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchJson<FundingResult>("/api/funding")
      .then((data) => {
        if (!active) return;
        setFunding(data);
        setError(null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load funding data."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <section className="card" id="funding">
      <h2>Public funding transparency</h2>

      {loading ? <p className="muted">Loading funding data…</p> : null}

      {error ? (
        <p className="error">
          {error}{" "}
          <button
            className="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Retry
          </button>
        </p>
      ) : null}

      {funding ? (
        funding.configured ? (
          <>
            <div className="stat-grid">
              <div className="stat">
                <div className="muted">Received</div>
                <div className="stat-value">
                  {formatNumber(funding.totalReceivedSOL ?? 0)} SOL
                </div>
              </div>
              <div className="stat">
                <div className="muted">Spent</div>
                <div className="stat-value">
                  {formatNumber(funding.totalSpentSOL ?? 0)} SOL
                </div>
              </div>
              <div className="stat">
                <div className="muted">Current balance</div>
                <div className="stat-value">
                  {formatNumber(funding.balanceSOL ?? 0)} SOL
                </div>
              </div>
            </div>

            <p className="muted">
              {funding.transactionsAnalyzed} recent{" "}
              {funding.transactionsAnalyzed === 1 ? "transaction" : "transactions"}{" "}
              analyzed from the funding wallet{" "}
              <a
                className="mono"
                href={`${EXPLORER}/address/${funding.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {funding.wallet}
              </a>
            </p>

            <p>
              <a className="button" href="/api/reports/funding" download>
                Download funding report (CSV)
              </a>
            </p>

            {funding.records?.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Signature</th>
                    <th>Time</th>
                    <th>Direction</th>
                    <th>Amount</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {funding.records.map((record) => (
                    <tr key={record.signature}>
                      <td className="mono">
                        <a
                          href={`${EXPLORER}/tx/${record.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {record.signature.slice(0, 16)}…
                        </a>
                      </td>
                      <td className="muted">
                        {formatTimestamp(record.timestamp)}
                      </td>
                      <td>
                        {record.direction === "in" ? "received" : "spent"}
                      </td>
                      <td className="mono">{formatNumber(record.amountSOL)}</td>
                      <td className="mono muted">
                        {formatNumber(record.feeSOL)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">
                No funding transactions have been recorded for this wallet yet.
                The $45,000 grant request is a funding target, not money received.
                Anyone can verify activity from this wallet on Solana Explorer.
              </p>
            )}
          </>
        ) : (
          <p className="muted">{funding.message}</p>
        )
      ) : null}
    </section>
  );
}

interface MilestoneEntry {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
}

interface ProposalEntry {
  title: string;
  description?: string;
  status?: string;
}

const STATUS_LABELS: Record<string, string> = {
  complete: "Complete",
  "in-progress": "In progress",
  planned: "Planned",
};

/** Renders a milestone/proposal status in title case. */
function formatStatus(status?: string): string {
  if (!status) {
    return "—";
  }
  return STATUS_LABELS[status] ?? status;
}

/**
 * Completed milestones show their implementation month (YYYY-MM) from
 * git history, falling back to a pointer at that history; planned
 * milestones have no confirmed schedule yet, so none is invented.
 */
function scheduleEvidence(milestone: MilestoneEntry): string {
  if (milestone.status === "complete") {
    return milestone.dueDate ?? "See Git history";
  }
  return "To be scheduled";
}

function MilestonesPanel() {
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
  const [proposals, setProposals] = useState<ProposalEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchJson<{ milestones: MilestoneEntry[]; message: string | null }>(
        "/api/milestones"
      ),
      fetchJson<{ proposals: ProposalEntry[]; message: string | null }>(
        "/api/proposals"
      ),
    ])
      .then(([milestoneData, proposalData]) => {
        if (!active) return;
        setMilestones(milestoneData.milestones);
        setProposals(proposalData.proposals);
        setError(null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load milestones."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card" id="milestones">
      <h2>Milestones &amp; community proposals</h2>
      <p className="muted">
        Published through versioned data files in this repository, so every
        change is auditable in git history.
      </p>

      {loading ? <p className="muted">Loading milestones…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <h3>Milestones</h3>

          {milestones.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Status</th>
                  <th>Schedule / evidence</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{milestone.title}</strong>
                      {milestone.description ? (
                        <div className="muted">{milestone.description}</div>
                      ) : null}
                    </td>
                    <td className="nowrap">
                      {formatStatus(milestone.status)}
                    </td>
                    <td className="nowrap">
                      {scheduleEvidence(milestone)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No milestones have been published yet.</p>
          )}

          <h3>Community proposals</h3>

          {proposals.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proposal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{proposal.title}</strong>
                      {proposal.description ? (
                        <div className="muted">{proposal.description}</div>
                      ) : null}
                    </td>
                    <td className="nowrap">
                      {formatStatus(proposal.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">
              No community proposals have been submitted yet. Open a pull
              request to publish one.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}

const features = [
  "Wallet inspection — balance, tokens, recent activity",
  "Transaction verification — status, fees, balance and token movements",
  "Token and liquidity transparency — SPL holdings of any wallet",
  "Public funding transparency — on-chain funding wallet summaries",
  "Milestone and proposal tracking — published via versioned data files",
];

export default function Home() {
  return (
    <main className="container">
      <header>
        <h1>GLASSBOX</h1>
        <p className="muted">
          Solana Transparency &amp; Accountability Toolkit
        </p>
        <p className="muted mono">Network: {NETWORK}</p>
        <nav className="site-nav" aria-label="Sections">
          <a href="#wallet">Wallet</a>
          <a href="#transaction">Transactions</a>
          <a href="#funding">Funding</a>
          <a href="#milestones">Milestones</a>
          <a href="/demo">Funding demo</a>
        </nav>
      </header>

      <section style={{ marginTop: 32 }}>
        <h2>Make blockchain activity easier to inspect and verify.</h2>
        <p>
          Glassbox reads public Solana blockchain data and presents it in
          clear, verifiable summaries — no private keys, no sign-in, no
          transactions.
        </p>
      </section>

      <WalletInspector />
      <TransactionVerifier />
      <FundingPanel />
      <MilestonesPanel />

      <section className="card">
        <h2>Platform features</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature} style={{ marginBottom: 12 }}>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Security first</h2>
        <p>
          Glassbox will never ask for your private keys or wallet recovery
          phrase. Only public blockchain information is used.
        </p>
      </section>

      <footer style={{ marginTop: 48 }} className="muted">
        Glassbox — open-source transparency for Solana.
      </footer>
    </main>
  );
}
