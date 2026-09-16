import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { requireEnv } from "@/lib/env";

const ALG = "HS256";
const EXPIRES_IN = "7d";

function getSecretKey() {
  return new TextEncoder().encode(requireEnv("JWT_SECRET"));
}

export interface SessionPayload extends JWTPayload {
  sub: string;
  uuid: string | null;
  email: string;
  name: string;
}

export function signJwt(payload: Omit<SessionPayload, "iat" | "exp">) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecretKey());
}

export async function verifyJwt(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as SessionPayload;
}
