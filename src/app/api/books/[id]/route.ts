import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { parseBookFields } from "@/lib/books/fields";

function parseBookId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawId } = await params;
  const id = parseBookId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível buscar o livro" },
      { status: 500 }
    );
  }
  if (!book) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawId } = await params;
  const id = parseBookId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseBookFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "nenhum campo para atualizar" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: book, error } = await supabase
    .from("books")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível atualizar o livro" },
      { status: 500 }
    );
  }
  if (!book) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawId } = await params;
  const id = parseBookId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: book, error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível excluir o livro" },
      { status: 500 }
    );
  }
  if (!book) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
