import { describe, expect, it } from "vitest";
import milestonesData from "../data/milestones.json";
import proposalsData from "../data/proposals.json";

interface PublishedRecord {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string;
}

describe("data files", () => {
  it("milestones.json holds an array of records with string titles", () => {
    const milestones = milestonesData.milestones as unknown as PublishedRecord[];

    expect(Array.isArray(milestones)).toBe(true);

    for (const milestone of milestones) {
      expect(typeof milestone).toBe("object");
      expect(typeof milestone.title).toBe("string");
    }
  });

  it("proposals.json holds an array of records with string titles", () => {
    const proposals = proposalsData.proposals as unknown as PublishedRecord[];

    expect(Array.isArray(proposals)).toBe(true);

    for (const proposal of proposals) {
      expect(typeof proposal).toBe("object");
      expect(typeof proposal.title).toBe("string");
    }
  });
});