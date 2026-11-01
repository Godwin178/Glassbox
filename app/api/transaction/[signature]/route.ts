import { NextResponse } from "next/server";
import type { ParsedTransactionWithMeta } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidSignature, normalizeInput } from "@/lib/validation";
import {
  summarizeTokenBalanceChanges,
  toTokenBalanceEntries,
} from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { signature: string } }
) {
  const signature = normalizeInput(params.signature);

  if (!isValidSignature(signature)) {
    return NextResponse.json(
      { error: "Invalid transaction signature" },
      { status: 400 }
    );
  }

  const connection = getConnection();

  let transaction: ParsedTransactionWithMeta | null;

  try {
    transaction = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
  } catch (error) {
    console.error("Transaction lookup failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to reach the Solana network. Check your RPC configuration and try again.",
      },
      { status: 502 }
    );
  }

  if (!transaction) {
    return NextResponse.json({
      signature,
      found: false,
      message:
        "Transaction not found on the selected network. It may be too recent or belong to a different cluster.",
    });
  }

  const meta = transaction.meta;

  if (!meta) {
    return NextResponse.json({
      signature,
      found: true,
      status: "unknown",
      message:
        "Transaction found, but its status metadata is not available yet. Try again shortly.",
    });
  }

  const accountKeys = transaction.transaction.message.accountKeys.map(
    (key) => key.pubkey.toBase58()
  );

  const balanceChanges = accountKeys
    .map((address, index) => ({
      address,
      deltaSOL: lamportsToSol(
        (meta.postBalances[index] ?? 0) - (meta.preBalances[index] ?? 0)
      ),
    }))
    .filter((change) => change.deltaSOL !== 0);

  const tokenChanges = summarizeTokenBalanceChanges(
    toTokenBalanceEntries(meta.preTokenBalances),
    toTokenBalanceEntries(meta.postTokenBalances)
  );

  return NextResponse.json({
    signature,
    found: true,
    status: meta.err ? "failed" : "successful",
    error: meta.err,
    slot: transaction.slot,
    blockTime: transaction.blockTime ?? null,
    feeLamports: meta.fee,
    feeSOL: lamportsToSol(meta.fee),
    feePayer: accountKeys[0] ?? null,
    accountKeys,
    balanceChanges,
    tokenChanges,
  });
}
