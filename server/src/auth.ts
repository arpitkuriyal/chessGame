import { createPublicKey, verify as verifySignature } from "crypto";
import type { JsonWebKey as CryptoJsonWebKey } from "crypto";

type ClerkJwk = CryptoJsonWebKey & { kid?: string; alg?: string; use?: string };
type ClerkClaims = { sub?: string; iss?: string; exp?: number; nbf?: number };

let cachedKeys: ClerkJwk[] = [];
let keysCachedAt = 0;
const KEY_CACHE_MS = 5 * 60 * 1000;

async function getSigningKey(kid: string): Promise<ClerkJwk | null> {
  const jwksUrl = process.env.CLERK_JWKS_URL;
  const expectedIssuer = process.env.CLERK_ISSUER;
  if (!jwksUrl || !expectedIssuer) throw new Error("Clerk session verification is not configured");
  if (new URL(jwksUrl).protocol !== "https:") {
    throw new Error("CLERK_JWKS_URL must use HTTPS");
  }

  const now = Date.now();
  let key = cachedKeys.find((candidate) => candidate.kid === kid);
  if (key && now - keysCachedAt < KEY_CACHE_MS) return key;

  const response = await fetch(jwksUrl);
  if (!response.ok) throw new Error("Unable to retrieve Clerk signing keys");
  const body = (await response.json()) as { keys?: ClerkJwk[] };
  if (!Array.isArray(body.keys)) throw new Error("Invalid Clerk signing keys response");

  cachedKeys = body.keys;
  keysCachedAt = now;
  key = cachedKeys.find((candidate) => candidate.kid === kid);
  return key ?? null;
}

export async function verifyClerkSessionToken(token: string): Promise<string> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid session token");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as {
    alg?: string;
    kid?: string;
  };
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported session token");
  }

  const key = await getSigningKey(header.kid);
  if (!key) throw new Error("Unknown session token signing key");

  const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as ClerkClaims;
  const publicKey = createPublicKey({ key, format: "jwk" });
  const validSignature = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    publicKey,
    Buffer.from(parts[2], "base64url")
  );

  const expectedIssuer = process.env.CLERK_ISSUER;
  const now = Math.floor(Date.now() / 1000);
  if (
    !validSignature ||
    !claims.sub ||
    !claims.iss ||
    claims.iss !== expectedIssuer ||
    typeof claims.exp !== "number" ||
    claims.exp <= now ||
    (typeof claims.nbf === "number" && claims.nbf > now)
  ) {
    throw new Error("Invalid or expired session token");
  }

  return claims.sub;
}
