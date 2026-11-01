export interface FundingTransactionLike {
  signature: string;
  slot: number;
  blockTime: number | null;
  fee: number;
  walletIndex: number;
  preBalance: number;
  postBalance: number;
}

export interface FundingRecord {
  signature: string;
  slot: number;
  timestamp: number | null;
  direction: "in" | "out";
  amountLamports: number;
  feeLamports: number;
}

export interface FundingSummary {
  totalReceivedLamports: number;
  totalSpentLamports: number;
  records: FundingRecord[];
}

/**
 * Pure helper: summarizes on-chain activity of a funding wallet.
 *
 * Incoming SOL (a positive lamport delta on the wallet) counts as
 * received; outgoing SOL counts as spent. The outgoing amount is the
 * gross outflow, so it includes the transaction fee the wallet paid.
 * Failed transactions are ignored.
 */
export function summarizeFunding(
  transactions: FundingTransactionLike[]
): FundingSummary {
  let totalReceivedLamports = 0;
  let totalSpentLamports = 0;
  const records: FundingRecord[] = [];

  for (const tx of transactions) {
    const delta = tx.postBalance - tx.preBalance;

    if (delta === 0) {
      continue;
    }

    const amountLamports = Math.abs(delta);

    if (delta > 0) {
      totalReceivedLamports += amountLamports;
    } else {
      totalSpentLamports += amountLamports;
    }

    records.push({
      signature: tx.signature,
      slot: tx.slot,
      timestamp: tx.blockTime,
      direction: delta > 0 ? "in" : "out",
      amountLamports,
      feeLamports: tx.fee,
    });
  }

  return { totalReceivedLamports, totalSpentLamports, records };
}
