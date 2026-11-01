/**
 * Simulated funding demo data.
 *
 * Everything in this file is SIMULATED DATA — NOT REAL BLOCKCHAIN
 * TRANSACTIONS. It is rendered only on the /demo page and must never
 * be mixed with the live wallet data in lib/funding.ts.
 */

export const DEMO_DISCLAIMER =
  "SIMULATED DATA — NOT REAL BLOCKCHAIN TRANSACTIONS";

export interface DemoTransaction {
  id: string;
  timestamp: string;
  direction: "in" | "out";
  amountSOL: number;
  feeSOL: number;
  note: string;
}

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: "SIMULATED-0001",
    timestamp: "2026-10-01 12:00 UTC",
    direction: "in",
    amountSOL: 12.5,
    feeSOL: 0.000005,
    note: "Example grant payout",
  },
  {
    id: "SIMULATED-0002",
    timestamp: "2026-10-08 09:30 UTC",
    direction: "in",
    amountSOL: 7.25,
    feeSOL: 0.000005,
    note: "Example community donation",
  },
  {
    id: "SIMULATED-0003",
    timestamp: "2026-10-15 16:45 UTC",
    direction: "out",
    amountSOL: 3.1,
    feeSOL: 0.000005,
    note: "Example bug bounty payout",
  },
  {
    id: "SIMULATED-0004",
    timestamp: "2026-10-22 10:15 UTC",
    direction: "out",
    amountSOL: 1.65,
    feeSOL: 0.000005,
    note: "Example infrastructure payment",
  },
];

function sumWhere(direction: "in" | "out"): number {
  return DEMO_TRANSACTIONS.reduce(
    (sum, tx) => (tx.direction === direction ? sum + tx.amountSOL : sum),
    0
  );
}

export const DEMO_TOTAL_RECEIVED_SOL = sumWhere("in");

export const DEMO_TOTAL_SPENT_SOL = sumWhere("out");

export const DEMO_BALANCE_SOL =
  DEMO_TOTAL_RECEIVED_SOL - DEMO_TOTAL_SPENT_SOL;

/** Escapes a field for RFC 4180 CSV output. Local to the demo so this
 * page never pulls the Solana SDK into the browser bundle. */
export function escapeDemoCsvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Renders the sample ledger as a CSV report, every row marked simulated. */
export function demoCsv(): string {
  const header = "id,timestamp,direction,amount_SOL,fee_SOL,note";

  const rows = DEMO_TRANSACTIONS.map((tx) =>
    [
      tx.id,
      tx.timestamp,
      tx.direction,
      tx.amountSOL,
      tx.feeSOL,
      `${tx.note} (simulated)`,
    ]
      .map((field) => escapeDemoCsvField(String(field)))
      .join(",")
  );

  return [header, ...rows].join("\n");
}
