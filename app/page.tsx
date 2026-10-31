app/page.tsx
"use client";

import { useState } from "react";

const features = [
  "Solana wallet inspection",
  "Transaction verification",
  "Public funding transparency",
  "Expense tracking",
  "Milestone tracking",
  "Community proposals",
  "Public transparency reports",
];

export default function Home() {
  const [address, setAddress] = useState("");

  function inspectWallet() {
    const value = address.trim();

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
      alert("Enter a valid Solana wallet address.");
      return;
    }

    window.open(
      `https://explorer.solana.com/address/${encodeURIComponent(value)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: "auto", padding: 32 }}>
      <header>
        <h1>GLASSBOX</h1>
        <p>Solana Transparency & Accountability Toolkit</p>
      </header>

      <section style={{ marginTop: 64 }}>
        <p>OPEN-SOURCE SOLANA TRANSPARENCY</p>
        <h2>Make blockchain activity easier to inspect and verify.</h2>
        <p>
          Tools for wallet inspection, transaction verification,
          public funding transparency and community accountability.
        </p>

        <h3>Inspect a Solana wallet</h3>
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter public Solana wallet address"
          style={{ width: "100%", padding: 14, marginBottom: 12 }}
        />
        <button onClick={inspectWallet} style={{ padding: 14 }}>
          Open in Solana Explorer
        </button>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2>Platform features</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature} style={{ marginBottom: 12 }}>
              {feature} — Planned
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 48 }}>
        <h3>Security first</h3>
        <p>
          Glassbox will never ask for your private keys or wallet
          recovery phrase. Only public blockchain information is used.
        </p>
      </section>

      <footer style={{ marginTop: 64, opacity: 0.7 }}>
        Glassbox — Open source transparency for Solana.
      </footer>
    </main>
  );
}