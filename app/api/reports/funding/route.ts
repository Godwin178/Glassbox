import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/solana";
import { isValidAddress } from "@/lib/validation";
import { gatherFundingInputs, summarizeFunding } from "@/lib/funding";
import { fundingCsv } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  const walletAddress = process.env.GLASSBOX_FUNDING_WALLET?.trim() ?? "";

  if (!walletAddress) {
    return NextResponse.json(
      {
        error:
          "No public funding wallet is configured. Set GLASSBOX_FUNDING_WALLET to enable funding reports.",
      },
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
    const { inputs } = await gatherFundingInputs(getConnection(), wallet);
    const { records } = summarizeFunding(inputs);

    return new Response(fundingCsv(records), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="glassbox-funding-report.csv"',
      },
    });
  } catch (error) {
    console.error("Funding report failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to build the funding report from the Solana network. Try again shortly.",
      },
      { status: 502 }
    );
  }
}