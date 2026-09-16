import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { isBookOwnedByUser } from "@/lib/books/ownership";
import { parseSessionFields } from "@/lib/sessions/fields";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseBookId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawBookId } = await params;
  const bookId = parseBookId(rawBookId);
  if (bookId === null) {
    return NextResponse.json({ error: "book_id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!(await isBookOwnedByUser(supabase, bookId, Number(session.sub)))) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const offsetParam = Number(searchParams.get("offset") ?? 0);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = Number.isFinite(offsetParam) ? Math.max(Math.trunc(offsetParam), 0) : 0;

  const { data, error, count } = await supabase
    .from("sessions_book")
    .select("*", { count: "exact" })
    .eq("book_id", bookId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "não foi possível listar as sessões" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessions: data, total: count, limit, offset });
}

export async function POST(request: Request, { params }: RouteContext) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { id: rawBookId } = await params;
  const bookId = parseBookId(rawBookId);
  if (bookId === null) {
    return NextResponse.json({ error: "book_id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!(await isBookOwnedByUser(supabase, bookId, Number(session.sub)))) {
    return NextResponse.json({ error: "livro não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSessionFields(body ?? {});
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data: readingSession, error } = await supabase
    .from("sessions_book")
    .insert({ ...parsed.data, book_id: bookId })
    .select("*")
    .single();

  if (error || !readingSession) {
    return NextResponse.json(
      { error: "não foi possível criar a sessão" },
      { status: 500 }
    );
  }

  return NextResponse.json({ session: readingSession }, { status: 201 });
}
