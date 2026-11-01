"use client";

import { useCallback, useEffect, useState } from "react";

const EXPLORER = "https://explorer.solana.com";

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

  return (
    <section className="card">
      <h2>Inspect a Solana wallet</h2>
      <p className="muted">
        Balance, token holdings and recent activity, read directly from the
        Solana blockchain.
      </p>

      <input
        className="input"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Enter a public Solana wallet address"
        aria-label="Solana wallet address"
      />

      <p>
        <button className="button" onClick={inspect} disabled={loading}>
          {loading ? "Inspecting…" : "Inspect wallet"}
        </button>
      </p>

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
          ) : null}

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
          ) : null}
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

  return (
    <section className="card">
      <h2>Verify a transaction</h2>
      <p className="muted">
        Confirmation status, fee, SOL movements and token movements for any
        transaction.
      </p>

      <input
        className="input"
        value={signature}
        onChange={(event) => setSignature(event.target.value)}
        placeholder="Enter a transaction signature"
        aria-label="Transaction signature"
      />

      <p>
        <button className="button" onClick={verify} disabled={loading}>
          {loading ? "Verifying…" : "Verify transaction"}
        </button>
      </p>

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
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function FundingPanel() {
  const [funding, setFunding] = useState<FundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<FundingResult>("/api/funding")
      .then(setFunding)
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load funding data."
        )
      );
  }, []);

  return (
    <section className="card">
      <h2>Public funding transparency</h2>

      {error ? <p className="error">{error}</p> : null}

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
              {funding.transactionsAnalyzed} recent transactions analyzed from{" "}
              <span className="mono">{funding.wallet}</span>
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
            ) : null}
          </>
        ) : (
          <p className="muted">{funding.message}</p>
        )
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
