import { describe, expect, it } from "vitest";
import {
  isValidAddress,
  isValidBase58,
  isValidSignature,
  normalizeInput,
} from "../lib/validation";

const VALID_ADDRESS = "So11111111111111111111111111111111111111112";

describe("normalizeInput", () => {
  it("trims whitespace from strings", () => {
    expect(normalizeInput("  abc  ")).toBe("abc");
  });

  it("returns an empty string for non-string input", () => {
    expect(normalizeInput(undefined)).toBe("");
    expect(normalizeInput(42)).toBe("");
    expect(normalizeInput(null)).toBe("");
  });
});

describe("isValidBase58", () => {
  it("accepts base58 characters", () => {
    expect(isValidBase58("abcXYZ1239")).toBe(true);
  });

  it("rejects lookalike characters that are not base58", () => {
    expect(isValidBase58("0OIl")).toBe(false);
  });

  it("rejects empty and non-string-safe values", () => {
    expect(isValidBase58("")).toBe(false);
    expect(isValidBase58("abc def")).toBe(false);
  });
});

describe("isValidAddress", () => {
  it("accepts a real Solana address", () => {
    expect(isValidAddress(VALID_ADDRESS)).toBe(true);
  });

  it("rejects values that are too short", () => {
    expect(isValidAddress("abc")).toBe(false);
  });

  it("rejects values that are too long", () => {
    expect(isValidAddress(VALID_ADDRESS + VALID_ADDRESS)).toBe(false);
  });

  it("rejects non-base58 characters", () => {
    expect(isValidAddress("0".repeat(40))).toBe(false);
  });
});

describe("isValidSignature", () => {
  it("accepts a plausible 64-byte signature", () => {
    const signature = "a".repeat(64);
    expect(isValidSignature(signature)).toBe(true);
  });

  it("rejects short values", () => {
    expect(isValidSignature("a".repeat(63))).toBe(false);
  });

  it("rejects long values", () => {
    expect(isValidSignature("a".repeat(89))).toBe(false);
  });
});
