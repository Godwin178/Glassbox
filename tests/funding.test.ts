import { describe, expect, it } from "vitest";
import { summarizeFunding } from "../lib/funding";
import type { FundingTransactionLike } from "../lib/funding";

function tx(overrides: Partial<FundingTransactionLike>): FundingTransactionLike {
  return {
    signature: "sig",
    slot: 1,
    blockTime: 1700000000,
    fee: 5000,
    walletIndex: 0,
    preBalance: 1_000_000_000,
    postBalance: 1_000_000_000,
    ...overrides,
  };
}

describe("summarizeFunding", () => {
  it("summarizes received funds", () => {
    const summary = summarizeFunding([
      tx({ preBalance: 1_000_000_000, postBalance: 2_500_000_000 }),
    ]);

    expect(summary.totalReceivedLamports).toBe(1_500_000_000);
    expect(summary.totalSpentLamports).toBe(0);
    expect(summary.records).toHaveLength(1);
    expect(summary.records[0]).toMatchObject({
      direction: "in",
      amountLamports: 1_500_000_000,
    });
  });

  it("summarizes spending including the fee", () => {
    const summary = summarizeFunding([
      tx({ preBalance: 2_000_000_000, postBalance: 1_400_000_000, fee: 5000 }),
    ]);

    // Gross outflow: 600,000,000 lamports (transfer + fee).
    expect(summary.totalSpentLamports).toBe(600_000_000);
    expect(summary.totalReceivedLamports).toBe(0);
    expect(summary.records[0]).toMatchObject({
      direction: "out",
      amountLamports: 600_000_000,
      feeLamports: 5000,
    });
  });

  it("handles both directions across many transactions", () => {
    const summary = summarizeFunding([
      tx({ signature: "older-in", preBalance: 0, postBalance: 5_000_000_000 }),
      tx({ signature: "later-in", preBalance: 5_000_000_000, postBalance: 6_000_000_000 }),
      tx({
        signature: "spend",
        preBalance: 6_000_000_000,
        postBalance: 4_500_000_000,
      }),
    ]);

    expect(summary.totalReceivedLamports).toBe(6_000_000_000);
    expect(summary.totalSpentLamports).toBe(1_500_000_000);
    expect(summary.records).toHaveLength(3);
  });

  it("ignores transactions with no balance change", () => {
    const summary = summarizeFunding([tx({})]);

    expect(summary.records).toEqual([]);
    expect(summary.totalReceivedLamports).toBe(0);
    expect(summary.totalSpentLamports).toBe(0);
  });

  it("reports a fee-only self transaction as spending", () => {
    const summary = summarizeFunding([
      tx({ preBalance: 1_000_000_000, postBalance: 999_995_000, fee: 5000 }),
    ]);

    expect(summary.totalSpentLamports).toBe(5000);
  });
});
