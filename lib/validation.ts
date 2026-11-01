const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function normalizeInput(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidBase58(value: string): boolean {
  return BASE58_PATTERN.test(value);
}

/** Solana public keys are base58 and 32 bytes (32-44 characters). */
export function isValidAddress(value: string): boolean {
  return isValidBase58(value) && value.length >= 32 && value.length <= 44;
}

/** Transaction signatures are base58 and 64 bytes (64-88 characters). */
export function isValidSignature(value: string): boolean {
  return isValidBase58(value) && value.length >= 64 && value.length <= 88;
}
