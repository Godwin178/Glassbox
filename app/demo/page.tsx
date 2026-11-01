"use client";

import { useCallback } from "react";
import {
  DEMO_BALANCE_SOL,
  DEMO_DISCLAIMER,
  DEMO_TOTAL_RECEIVED_SOL,
  DEMO_TOTAL_SPENT_SOL,
  DEMO_TRANSACTIONS,
  demoCsv,
} from "@/lib/demo";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9,
  }).format(value);
}

export default function DemoPage() {
  const downloadCsv = useCallback(() => {
    const blob = new Blob([demoCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "glassbox-demo-funding-report-SIMULATED.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <main className="container">
      <header>
        <h1>GLASSBOX — Funding demo</h1>
        <p className="muted">
          An illustrative walkthrough of the funding transparency format.
        </p>
        <nav className="site-nav" aria-label="Pages">
          <a href="/">Live dashboard</a>
        </nav>
      </header>

      <section className="notice" role="alert">
        <strong>{DEMO_DISCLAIMER}</strong>
        <p>
          Everything on this page is illustrative sample content generated
          inside the browser. No live wallet, RPC request or blockchain
          data is involved, and demo records are never mixed with the live
          funding page. The live funding panel shows an honest empty state
          until the funding wallet records real activity.
        </p>
      </section>

      <section className="card">
        <h2>Example funding summary</h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="muted">Received (example)</div>
            <div className="stat-value">
              {formatNumber(DEMO_TOTAL_RECEIVED_SOL)} SOL
            </div>
          </div>
          <div className="stat">
            <div className="muted">Spent (example)</div>
            <div className="stat-value">
              {formatNumber(DEMO_TOTAL_SPENT_SOL)} SOL
            </div>
          </div>
          <div className="stat">
            <div className="muted">Balance (example)</div>
            <div className="stat-value">
              {formatNumber(DEMO_BALANCE_SOL)} SOL
            </div>
          </div>
        </div>
        <p className="muted">
          Balance calculation: {formatNumber(DEMO_TOTAL_RECEIVED_SOL)}{" "}
          received − {formatNumber(DEMO_TOTAL_SPENT_SOL)} spent ={" "}
          {formatNumber(DEMO_BALANCE_SOL)} SOL
        </p>
      </section>

      <section className="card">
        <h2>Sample transaction ledger</h2>
        <p className="muted">
          A walkthrough of the per-transaction records the live funding
          page publishes from the blockchain.
        </p>

        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Time</th>
              <th>Direction</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_TRANSACTIONS.map((tx) => (
              <tr key={tx.id}>
                <td className="mono nowrap">{tx.id}</td>
                <td className="muted">{tx.timestamp}</td>
                <td>{tx.direction === "in" ? "received" : "spent"}</td>
                <td className={tx.direction === "in" ? "ok" : "error"}>
                  {tx.direction === "in" ? "+" : "−"}
                  {formatNumber(tx.amountSOL)}
                </td>
                <td className="mono muted">{formatNumber(tx.feeSOL)}</td>
                <td className="muted">{tx.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          <button className="button" onClick={downloadCsv}>
            Download sample CSV report
          </button>
        </p>
        <p className="muted">
          The downloaded file is named with SIMULATED and every row is
          marked as simulated, so a sample report can never be mistaken
          for a real funding record.
        </p>
      </section>

      <footer style={{ marginTop: 48 }} className="muted">
        Glassbox — open-source transparency for Solana.
      </footer>
    </main>
  );
}
