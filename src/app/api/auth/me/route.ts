import { NextResponse } from "next/server";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const payload = await requireSession(request);
    return NextResponse.json({
      user: {
        id: payload.sub,
        uuid: payload.uuid,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }
}
