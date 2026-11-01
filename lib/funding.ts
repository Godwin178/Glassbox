import { PublicKey } from "@solana/web3.js";
import type { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";

const TRANSACTION_BATCH_SIZE = 25;
const MAX_TRANSACTIONS = 500;

/**
 * Reads the funding wallet's balance and recent on-chain activity from
 * the Solana network, producing the raw per-transaction inputs that
 * summarizeFunding turns into a transparency summary.
 */
export async function gatherFundingInputs(
  connection: Connection,
  wallet: PublicKey
): Promise<{
  balanceLamports: number;
  inputs: FundingTransactionLike[];
}> {
  const [balance, signatures] = await Promise.all([
    connection.getBalance(wallet),
    connection.getSignaturesForAddress(wallet, {
      limit: MAX_TRANSACTIONS,
    }),
  ]);

  const successful = signatures.filter((entry) => !entry.err);
  const inputs: FundingTransactionLike[] = [];

  for (let i = 0; i < successful.length; i += TRANSACTION_BATCH_SIZE) {
    const batch = successful
      .slice(i, i + TRANSACTION_BATCH_SIZE)
      .map((entry) => entry.signature);

    const parsedBatch: (ParsedTransactionWithMeta | null)[] =
      await connection.getParsedTransactions(batch, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

    for (const tx of parsedBatch) {
      if (!tx || !tx.meta) {
        continue;
      }

      const keys = tx.transaction.message.accountKeys;
      const walletIndex = keys.findIndex((key) =>
        key.pubkey.equals(wallet)
      );

      if (walletIndex === -1) {
        continue;
      }

      inputs.push({
        signature: tx.transaction.signatures[0] ?? "",
        slot: tx.slot,
        blockTime: tx.blockTime ?? null,
        fee: tx.meta.fee,
        walletIndex,
        preBalance: tx.meta.preBalances[walletIndex] ?? 0,
        postBalance: tx.meta.postBalances[walletIndex] ?? 0,
      });
    }
  }

  return { balanceLamports: balance, inputs };
}
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
