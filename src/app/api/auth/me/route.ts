import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookies";
import { verifyJwt } from "@/lib/auth/jwt";

export async function GET() {
  const token = await getAuthCookie();
  if (!token) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    return NextResponse.json({
      user: {
        id: payload.sub,
        uuid: payload.uuid,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch {
    return NextResponse.json({ error: "token inválido" }, { status: 401 });
  }
}
