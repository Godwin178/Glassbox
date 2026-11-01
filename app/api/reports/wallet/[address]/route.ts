import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection, lamportsToSol } from "@/lib/solana";
import { isValidAddress, normalizeInput } from "@/lib/validation";
import { fetchTokenHoldings } from "@/lib/tokens";

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
      connection.getSignaturesForAddress(wallet, { limit: 100 }),
      fetchTokenHoldings(connection, wallet, 500),
    ]);

    const report = {
      report: "wallet",
      generatedAt: new Date().toISOString(),
      wallet: wallet.toBase58(),
      balanceLamports: balance,
      balanceSOL: lamportsToSol(balance),
      tokenCount: tokens.length,
      tokens,
      recentTransactions: signatures.map((signature) => ({
        signature: signature.signature,
        slot: signature.slot,
        blockTime: signature.blockTime ?? null,
        failed: Boolean(signature.err),
        memo: signature.memo ?? null,
      })),
      explorer: `https://explorer.solana.com/address/${wallet.toBase58()}`,
    };

    return new Response(JSON.stringify(report, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="glassbox-wallet-report-${wallet.toBase58().slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    console.error("Wallet report failed:", error);
    return NextResponse.json(
      {
        error:
          "Unable to build the wallet report from the Solana network. Try again shortly.",
      },
      { status: 502 }
    );
  }
}