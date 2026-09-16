import "server-only";
import { getAuthCookie } from "@/lib/auth/cookies";
import { verifyJwt, type SessionPayload } from "@/lib/auth/jwt";

export class UnauthorizedError extends Error {}

export async function requireSession(): Promise<SessionPayload> {
  const token = await getAuthCookie();
  if (!token) {
    throw new UnauthorizedError();
  }
  try {
    return await verifyJwt(token);
  } catch {
    throw new UnauthorizedError();
  }
}
