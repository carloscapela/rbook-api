import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { isBookOwnedByUser } from "@/lib/books/ownership";
import { parseSessionFields } from "@/lib/sessions/fields";

function parsePositiveInt(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

type RouteContext = { params: Promise<{ id: string; sessionId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawBookId, sessionId: rawSessionId } = await params;
  const bookId = parsePositiveInt(rawBookId);
  const sessionId = parsePositiveInt(rawSessionId);
  if (bookId === null || sessionId === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!(await isBookOwnedByUser(supabase, bookId, Number(session.sub)))) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  const { data: readingSession, error } = await supabase
    .from("sessions_book")
    .select("*")
    .eq("id", sessionId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível buscar a sessão" },
      { status: 500 }
    );
  }
  if (!readingSession) {
    return NextResponse.json({ error: "sessão não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ session: readingSession });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawBookId, sessionId: rawSessionId } = await params;
  const bookId = parsePositiveInt(rawBookId);
  const sessionId = parsePositiveInt(rawSessionId);
  if (bookId === null || sessionId === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!(await isBookOwnedByUser(supabase, bookId, Number(session.sub)))) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSessionFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "nenhum campo para atualizar" },
      { status: 400 }
    );
  }

  const { data: readingSession, error } = await supabase
    .from("sessions_book")
    .update(parsed.data)
    .eq("id", sessionId)
    .eq("book_id", bookId)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível atualizar a sessão" },
      { status: 500 }
    );
  }
  if (!readingSession) {
    return NextResponse.json({ error: "sessão não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ session: readingSession });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawBookId, sessionId: rawSessionId } = await params;
  const bookId = parsePositiveInt(rawBookId);
  const sessionId = parsePositiveInt(rawSessionId);
  if (bookId === null || sessionId === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!(await isBookOwnedByUser(supabase, bookId, Number(session.sub)))) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  const { data: readingSession, error } = await supabase
    .from("sessions_book")
    .delete()
    .eq("id", sessionId)
    .eq("book_id", bookId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível excluir a sessão" },
      { status: 500 }
    );
  }
  if (!readingSession) {
    return NextResponse.json({ error: "sessão não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
