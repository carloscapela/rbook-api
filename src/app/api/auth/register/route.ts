import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email e password são obrigatórios" },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "email inválido" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "password deve ter ao menos 8 caracteres" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "email já cadastrado" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ name, email, password: passwordHash })
    .select("id, uuid, name, email, created_at")
    .single();

  if (error || !user) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "email já cadastrado" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "não foi possível criar o usuário" },
      { status: 500 }
    );
  }

  const token = await signJwt({
    sub: String(user.id),
    uuid: user.uuid,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({ user, token }, { status: 201 });
}
