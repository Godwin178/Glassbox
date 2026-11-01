import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/solana";
import { isValidAddress, normalizeInput } from "@/lib/validation";
import { fetchTokenHoldings } from "@/lib/tokens";

export const dynamic = "force-dynamic";

const MAX_HOLDINGS = 500;

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  const address = normalizeInput(params.address);

  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  let wallet: PublicKey;

  try {
    wallet = new PublicKey(address);
  } catch {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  try {
    const tokens = await fetchTokenHoldings(
      getConnection(),
      wallet,
      MAX_HOLDINGS
    );

    return NextResponse.json({
      address: wallet.toBase58(),
      tokenCount: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error("Token lookup failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to reach the Solana network. Check your RPC configuration and try again.",
      },
      { status: 502 }
    );
  }
}
