import { describe, expect, it } from "vitest";
import { escapeCsvField, fundingCsv } from "../lib/reports";

describe("escapeCsvField", () => {
  it("leaves plain fields unchanged", () => {
    expect(escapeCsvField("abc")).toBe("abc");
  });

  it("quotes fields containing separators", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
    expect(escapeCsvField("a\nb")).toBe('"a\nb"');
  });

  it("doubles embedded quotes", () => {
    expect(escapeCsvField('a"b')).toBe('"a""b"');
  });
});

describe("fundingCsv", () => {
  it("emits a header and one row per record, converting lamports to SOL", () => {
    const csv = fundingCsv([
      {
        signature: "sig1",
        slot: 10,
        timestamp: 1700000000,
        direction: "in",
        amountLamports: 1_000_000_000,
        feeLamports: 5000,
      },
    ]);

    expect(csv).toBe(
      "signature,slot,timestamp,direction,amount_SOL,fee_SOL\n" +
        "sig1,10,1700000000,in,1,0.000005"
    );
  });

  it("emits a blank timestamp when unknown", () => {
    const csv = fundingCsv([
      {
        signature: "sig2",
        slot: 5,
        timestamp: null,
        direction: "out",
        amountLamports: 0,
        feeLamports: 5000,
      },
    ]);

    expect(csv).toContain("sig2,5,,out,0,0.000005");
  });

  it("returns just the header when there are no records", () => {
    expect(fundingCsv([])).toBe(
      "signature,slot,timestamp,direction,amount_SOL,fee_SOL"
    );
  });
});