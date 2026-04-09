import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  // 100000 iterations of SHA-512 is extremely secure and standard
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    const hashBuffer = Buffer.from(key, "hex");
    const derivedBuffer = pbkdf2Sync(password, salt, 100000, 64, "sha512");
    return timingSafeEqual(hashBuffer, derivedBuffer);
  } catch (err) {
    return false;
  }
}
