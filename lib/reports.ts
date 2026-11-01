import { lamportsToSol } from "./solana";
import type { FundingRecord } from "./funding";

/** Escapes a field for RFC 4180 CSV output. */
export function escapeCsvField(value: string): string {
  return /[",\n\r]/.test(value)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

/**
 * Pure helper: renders funding records as a CSV report, with amounts
 * converted from lamports to SOL.
 */
export function fundingCsv(records: FundingRecord[]): string {
  const header = "signature,slot,timestamp,direction,amount_SOL,fee_SOL";

  const rows = records.map((record) =>
    [
      record.signature,
      record.slot,
      record.timestamp === null ? "" : record.timestamp,
      record.direction,
      lamportsToSol(record.amountLamports),
      lamportsToSol(record.feeLamports),
    ]
      .map((field) => escapeCsvField(String(field)))
      .join(",")
  );

  return [header, ...rows].join("\n");
}