import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidAddress, normalizeInput } from "@/lib/validation";
import { fetchTokenHoldings } from "@/lib/tokens";
import { recordUsage } from "@/lib/usage";

export const dynamic = "force-dynamic";

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

  const connection = getConnection();

  try {
    const [balance, signatures, tokens] = await Promise.all([
      connection.getBalance(wallet),
      connection.getSignaturesForAddress(wallet, { limit: 20 }),
      fetchTokenHoldings(connection, wallet),
    ]);

    await recordUsage("wallet_inspection");

    return NextResponse.json({
      address: wallet.toBase58(),
      balanceLamports: balance,
      balanceSOL: lamportsToSol(balance),
      tokens,
      recentTransactions: signatures.map((signature) => ({
        signature: signature.signature,
        slot: signature.slot,
        blockTime: signature.blockTime ?? null,
        failed: Boolean(signature.err),
        memo: signature.memo ?? null,
      })),
    });
  } catch (error) {
    console.error("Wallet inspection failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to reach the Solana network. Check your RPC configuration and try again.",
      },
      { status: 502 }
    );
  }
}
