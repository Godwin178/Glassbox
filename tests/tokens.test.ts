import { describe, expect, it } from "vitest";
import {
  summarizeTokenBalanceChanges,
  toTokenBalanceEntries,
  type TokenBalanceEntry,
} from "../lib/tokens";

const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER_A = "wallet-a";
const OWNER_B = "wallet-b";

function entry(
  mint: string,
  uiAmount: number | null,
  owner?: string
): TokenBalanceEntry {
  return { mint, uiAmount, owner };
}

describe("summarizeTokenBalanceChanges", () => {
  it("reports an increase", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, 100, OWNER_A)],
      [entry(MINT, 150, OWNER_A)]
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      mint: MINT,
      owner: OWNER_A,
      uiAmountBefore: 100,
      uiAmountAfter: 150,
      delta: 50,
    });
  });

  it("reports a decrease", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, 100, OWNER_A)],
      [entry(MINT, 40, OWNER_A)]
    );

    expect(changes[0].delta).toBe(-60);
  });

  it("ignores unchanged balances", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, 100, OWNER_A)],
      [entry(MINT, 100, OWNER_A)]
    );

    expect(changes).toEqual([]);
  });

  it("reports a newly created token account", () => {
    const changes = summarizeTokenBalanceChanges(
      [],
      [entry(MINT, 25, OWNER_A)]
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      uiAmountBefore: 0,
      uiAmountAfter: 25,
      delta: 25,
    });
  });

  it("reports a fully closed token account", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, 25, OWNER_A)],
      []
    );

    expect(changes[0]).toMatchObject({
      uiAmountBefore: 25,
      uiAmountAfter: 0,
      delta: -25,
    });
  });

  it("separates owners of the same mint", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, 100, OWNER_A), entry(MINT, 10, OWNER_B)],
      [entry(MINT, 60, OWNER_A), entry(MINT, 20, OWNER_B)]
    );

    expect(changes).toHaveLength(2);
    expect(changes.map((change) => change.owner).sort()).toEqual([
      OWNER_A,
      OWNER_B,
    ]);
  });

  it("treats null uiAmounts as zero", () => {
    const changes = summarizeTokenBalanceChanges(
      [entry(MINT, null, OWNER_A)],
      [entry(MINT, 5, OWNER_A)]
    );

    expect(changes[0].delta).toBe(5);
  });
});

describe("toTokenBalanceEntries", () => {
  it("maps parsed transaction token balances", () => {
    const entries = toTokenBalanceEntries([
      {
        mint: MINT,
        owner: OWNER_A,
        uiTokenAmount: { uiAmount: 12.5 },
      },
    ] as never);

    expect(entries).toEqual([
      { mint: MINT, owner: OWNER_A, uiAmount: 12.5 },
    ]);
  });

  it("returns an empty list when balances are missing", () => {
    expect(toTokenBalanceEntries(undefined)).toEqual([]);
  });

  it("treats a missing uiAmount as null", () => {
    const entries = toTokenBalanceEntries([
      {
        mint: MINT,
        owner: OWNER_A,
        uiTokenAmount: { uiAmount: null },
      },
    ] as never);

    expect(entries[0].uiAmount).toBeNull();
  });
});
