import { Connection } from "@solana/web3.js";

export const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Returns the configured RPC endpoint. Glassbox only reads public
 * blockchain data, so this endpoint never needs a keypair.
 */
export function getRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || DEFAULT_RPC_URL;
}

export function getConnection(): Connection {
  return new Connection(getRpcUrl(), "confirmed");
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
