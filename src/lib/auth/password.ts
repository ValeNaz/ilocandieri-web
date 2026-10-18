import { hash, verify } from "@node-rs/argon2";

// argon2id (algorithm 2) with OWASP-grade parameters.
const OPTS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const MIN_PASSWORD_LENGTH = 10;

export const hashPassword = (plain: string) => hash(plain, OPTS);

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashed, plain);
  } catch {
    return false;
  }
}

/** Returns an Italian error message, or null when acceptable. */
export function passwordPolicyError(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) return `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`;
  if (pw.length > 200) return "La password è troppo lunga.";
  if (/^(.)\1+$/.test(pw)) return "Scegli una password meno prevedibile.";
  return null;
}

// Verified against this when the user does not exist, to keep response time uniform.
let dummy: Promise<string> | null = null;
export const dummyHash = () => (dummy ??= hashPassword("dummy-password-for-timing"));
