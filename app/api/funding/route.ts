import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidAddress } from "@/lib/validation";
import { gatherFundingInputs, summarizeFunding } from "@/lib/funding";

export const dynamic = "force-dynamic";

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

  try {
    const wallet = new PublicKey(walletAddress);
    const { balanceLamports, inputs } = await gatherFundingInputs(
      getConnection(),
      wallet
    );
    const summary = summarizeFunding(inputs);

    return NextResponse.json({
      project: "Glassbox",
      configured: true,
      wallet: wallet.toBase58(),
      currency: "SOL",
      totalReceivedSOL: lamportsToSol(summary.totalReceivedLamports),
      totalSpentSOL: lamportsToSol(summary.totalSpentLamports),
      balanceSOL: lamportsToSol(balanceLamports),
      transactionsAnalyzed: inputs.length,
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