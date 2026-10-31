app/api/wallet/[address]/route.ts
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const wallet = new PublicKey(params.address);

    if (!PublicKey.isOnCurve(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const rpcUrl =
      process.env.SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com";

    const connection = new Connection(rpcUrl, "confirmed");

    const [balance, signatures] = await Promise.all([
      connection.getBalance(wallet),
      connection.getSignaturesForAddress(wallet, { limit: 10 }),
    ]);

    return NextResponse.json({
      address: wallet.toBase58(),
      balanceSOL: balance / 1_000_000_000,
      recentTransactions: signatures,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to inspect this wallet. Check the address and try again." },
      { status: 400 }
    );
  }
}