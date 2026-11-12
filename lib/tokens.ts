import { PublicKey } from "@solana/web3.js";
import type { Connection, TokenBalance } from "@solana/web3.js";

/** SPL Token program (not exported by @solana/web3.js 1.x). */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export interface TokenHolding {
  account: string;
  mint: string;
  decimals: number | null;
  uiAmount: number | null;
  tokenProgram: string;
}

interface SplTokenAccountInfo {
  mint?: string;
  tokenAmount?: {
    uiAmount?: number | null;
    decimals?: number | null;
  };
}

/**
 * Reads token accounts controlled by a wallet and also checks whether the
 * supplied address is itself a parsed SPL token account (as can happen with
 * vault addresses). Both forms are included without double-counting.
 */
export async function fetchTokenHoldings(
  connection: Connection,
  owner: PublicKey,
  limit = 50
): Promise<TokenHolding[]> {
  const [splAccounts, token2022Accounts, addressInfo] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }),
    connection.getParsedAccountInfo(owner),
  ]);

  const accounts = [...splAccounts.value, ...token2022Accounts.value];
  const holdings: TokenHolding[] = accounts.flatMap((account) => {
    const data = account.account.data;

    if (
      !("parsed" in data) ||
      (data.program !== "spl-token" && data.program !== "spl-token-2022")
    ) {
      return [];
    }

    const info = data.parsed as SplTokenAccountInfo;
    if (!info?.mint) return [];

    return [{
      account: account.pubkey.toBase58(),
      mint: info.mint,
      decimals: info.tokenAmount?.decimals ?? null,
      uiAmount: info.tokenAmount?.uiAmount ?? null,
      tokenProgram: data.program,
    }];
  });

  // Some treasury/vault addresses are token accounts themselves, rather than
  // wallet authorities that own separate associated token accounts.
  const addressData = addressInfo.value?.data;
  if (addressData && "parsed" in addressData) {
    const program = addressData.program;
    const info = addressData.parsed as SplTokenAccountInfo;
    const address = owner.toBase58();

    if (
      (program === "spl-token" || program === "spl-token-2022") &&
      info?.mint &&
      !holdings.some((holding) => holding.account === address)
    ) {
      holdings.push({
        account: address,
        mint: info.mint,
        decimals: info.tokenAmount?.decimals ?? null,
        uiAmount: info.tokenAmount?.uiAmount ?? null,
        tokenProgram: program,
      });
    }
  }

  return holdings.slice(0, limit);
}

export interface TokenBalanceEntry {
  mint: string;
  owner?: string;
  uiAmount: number | null;
}

export interface TokenBalanceChange {
  mint: string;
  owner: string | null;
  uiAmountBefore: number;
  uiAmountAfter: number;
  delta: number;
}

/**
 * Pure helper: turns the pre/post token balance lists of a parsed
 * transaction into a per-mint summary of what changed.
 */
export function summarizeTokenBalanceChanges(
  before: TokenBalanceEntry[],
  after: TokenBalanceEntry[]
): TokenBalanceChange[] {
  const keyOf = (entry: TokenBalanceEntry) =>
    `${entry.mint}|${entry.owner ?? ""}`;

  const totals = new Map<
    string,
    { mint: string; owner: string | null; before: number; after: number }
  >();

  const add = (entries: TokenBalanceEntry[], side: "before" | "after") => {
    for (const entry of entries) {
      const key = keyOf(entry);
      const current =
        totals.get(key) ??
        {
          mint: entry.mint,
          owner: entry.owner ?? null,
          before: 0,
          after: 0,
        };

      current[side] += entry.uiAmount ?? 0;
      totals.set(key, current);
    }
  };

  add(before, "before");
  add(after, "after");

  return Array.from(totals.values()).flatMap((entry) => {
    const delta = entry.after - entry.before;

    if (delta === 0) {
      return [];
    }

    return [
      {
        mint: entry.mint,
        owner: entry.owner,
        uiAmountBefore: entry.before,
        uiAmountAfter: entry.after,
        delta,
      },
    ];
  });
}

/** Adapts the raw token balances of a parsed transaction for the summarizer. */
export function toTokenBalanceEntries(
  balances: TokenBalance[] | null | undefined
): TokenBalanceEntry[] {
  return (balances ?? []).map((entry) => ({
    mint: entry.mint,
    owner: entry.owner,
    uiAmount: entry.uiTokenAmount?.uiAmount ?? null,
  }));
}
