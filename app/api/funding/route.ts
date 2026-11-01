import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import type { ParsedTransactionWithMeta } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidAddress } from "@/lib/validation";
import { summarizeFunding } from "@/lib/funding";
import type { FundingTransactionLike } from "@/lib/funding";

export const dynamic = "force-dynamic";

const TRANSACTION_BATCH_SIZE = 25;
const MAX_TRANSACTIONS = 500;

export async function GET() {
  const walletAddress = process.env.GLASSBOX_FUNDING_WALLET?.trim() ?? "";

  if (!walletAddress) {
    return NextResponse.json({
      project: "Glassbox",
      configured: false,
      currency: "SOL",
      totalReceivedSOL: 0,
      totalSpentSOL: 0,
      balanceSOL: 0,
      transactionsAnalyzed: 0,
      records: [],
      message:
        "No public funding wallet is configured. Set GLASSBOX_FUNDING_WALLET to publish live on-chain funding data.",
    });
  }

  if (!isValidAddress(walletAddress)) {
    return NextResponse.json(
      { error: "GLASSBOX_FUNDING_WALLET is not a valid Solana address." },
      { status: 500 }
    );
  }

  const connection = getConnection();

  try {
    const wallet = new PublicKey(walletAddress);
    const [balance, signatures] = await Promise.all([
      connection.getBalance(wallet),
      connection.getSignaturesForAddress(wallet, {
        limit: MAX_TRANSACTIONS,
      }),
    ]);

    const successful = signatures.filter((entry) => !entry.err);
    const fundingInputs: FundingTransactionLike[] = [];

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

        fundingInputs.push({
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

    const summary = summarizeFunding(fundingInputs);

    return NextResponse.json({
      project: "Glassbox",
      configured: true,
      wallet: wallet.toBase58(),
      currency: "SOL",
      totalReceivedSOL: lamportsToSol(summary.totalReceivedLamports),
      totalSpentSOL: lamportsToSol(summary.totalSpentLamports),
      balanceSOL: lamportsToSol(balance),
      transactionsAnalyzed: fundingInputs.length,
      records: summary.records.map((record) => ({
        signature: record.signature,
        slot: record.slot,
        timestamp: record.timestamp,
        direction: record.direction,
        amountSOL: lamportsToSol(record.amountLamports),
        feeSOL: lamportsToSol(record.feeLamports),
      })),
    });
  } catch (error) {
    console.error("Funding summary failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to build the funding summary from the Solana network. Try again shortly.",
      },
      { status: 502 }
    );
  }
}
