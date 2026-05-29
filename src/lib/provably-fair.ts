import crypto from "crypto";

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateClientSeed(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function computeHash(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): string {
  const data = `${serverSeed}:${clientSeed}:${nonce}`;
  return crypto.createHmac("sha256", serverSeed).update(data).digest("hex");
}

export function hashToRoll(hash: string): number {
  const hex = hash.substring(0, 8);
  const decimal = parseInt(hex, 16);
  return (decimal % 10000) / 100;
}

export function calculateUpgradeResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  chance: number
): { won: boolean; roll: number; hash: string } {
  const hash = computeHash(serverSeed, clientSeed, nonce);
  const roll = hashToRoll(hash);
  const won = roll < chance;
  return { won, roll, hash };
}

export function verifyResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): { roll: number; hash: string } {
  const hash = computeHash(serverSeed, clientSeed, nonce);
  const roll = hashToRoll(hash);
  return { roll, hash };
}
