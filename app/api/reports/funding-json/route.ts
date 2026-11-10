import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidAddress } from "@/lib/validation";
import { gatherFundingInputs, summarizeFunding } from "@/lib/funding";

export const dynamic = "force-dynamic";

export async function GET() {
  const walletAddress = process.env.GLASSBOX_FUNDING_WALLET?.trim() ?? "";

  if (!walletAddress) {
    return NextResponse.json(
      { error: "No public funding wallet is configured." },
      { status: 409 }
    );
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

    return NextResponse.json(
      {
        project: "Glassbox",
        grantTargetUSD: 45000,
        currency: "SOL",
        wallet: wallet.toBase58(),
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
        note: "The USD grant target is not converted into SOL. On-chain totals are reported in SOL.",
      },
      {
        headers: {
          "Content-Disposition": 'attachment; filename="glassbox-funding-report.json"',
        },
      }
    );
  } catch (error) {
    console.error("Funding JSON report failed:", error);
    return NextResponse.json(
      { error: "Unable to build the funding report from the Solana network. Try again shortly." },
      { status: 502 }
    );
  }
}
