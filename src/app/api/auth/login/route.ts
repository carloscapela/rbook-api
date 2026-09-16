import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "email e password são obrigatórios" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, uuid, name, email, password, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error || !user || !user.password) {
    return NextResponse.json(
      { error: "credenciais inválidas" },
      { status: 401 }
    );
  }

  const passwordMatches = await verifyPassword(password, user.password);
  if (!passwordMatches) {
    return NextResponse.json(
      { error: "credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = await signJwt({
    sub: String(user.id),
    uuid: user.uuid,
    email: user.email,
    name: user.name,
  });

  const { password: _password, ...safeUser } = user;
  void _password;

  return NextResponse.json({ user: safeUser, token });
}
