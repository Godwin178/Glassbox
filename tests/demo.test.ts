import { describe, expect, it } from "vitest";
import {
  DEMO_BALANCE_SOL,
  DEMO_DISCLAIMER,
  DEMO_TOTAL_RECEIVED_SOL,
  DEMO_TOTAL_SPENT_SOL,
  DEMO_TRANSACTIONS,
  demoCsv,
} from "../lib/demo";

describe("demo funding data", () => {
  it("labels every record as simulated", () => {
    expect(DEMO_DISCLAIMER).toContain("SIMULATED DATA");

    for (const tx of DEMO_TRANSACTIONS) {
      expect(tx.id.startsWith("SIMULATED-")).toBe(true);
      expect(tx.note).toContain("Example");
    }
  });

  it("computes received, spent and balance totals", () => {
    expect(DEMO_TOTAL_RECEIVED_SOL).toBe(19.75);
    expect(DEMO_TOTAL_SPENT_SOL).toBe(4.75);
    expect(DEMO_BALANCE_SOL).toBe(15);
  });

  it("renders a CSV with a header and one row per transaction", () => {
    const csv = demoCsv();
    const lines = csv.split("\n");

    expect(lines).toHaveLength(DEMO_TRANSACTIONS.length + 1);
    expect(lines[0]).toBe("id,timestamp,direction,amount_SOL,fee_SOL,note");
    expect(lines[1]).toContain("SIMULATED-0001");
    expect(csv).toContain("simulated");
  });
});
