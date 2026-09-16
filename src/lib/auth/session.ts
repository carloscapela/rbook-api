import "server-only";
import { verifyJwt, type SessionPayload } from "@/lib/auth/jwt";

export class UnauthorizedError extends Error {}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

/** Autenticação stateless via header `Authorization: Bearer <token>`. */
export async function requireSession(request: Request): Promise<SessionPayload> {
  const token = extractBearerToken(request);
  if (!token) {
    throw new UnauthorizedError();
  }
  try {
    return await verifyJwt(token);
  } catch {
    throw new UnauthorizedError();
  }
}
