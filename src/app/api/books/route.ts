import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { parseBookFields } from "@/lib/books/fields";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Lista os livros do usuário autenticado
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books: { type: array, items: { $ref: '#/components/schemas/Book' } }
 *                 total: { type: integer }
 *                 limit: { type: integer }
 *                 offset: { type: integer }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
export async function GET(request: Request) {
  let session;
  try {
    session = await requireSession(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const offsetParam = Number(searchParams.get("offset") ?? 0);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = Number.isFinite(offsetParam) ? Math.max(Math.trunc(offsetParam), 0) : 0;

  const supabase = createAdminClient();
  const { data, error, count } = await supabase
    .from("books")
    .select("*", { count: "exact" })
    .eq("user_id", Number(session.sub))
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "não foi possível listar os livros" },
      { status: 500 }
    );
  }

  return NextResponse.json({ books: data, total: count, limit, offset });
}

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Cria um livro para o usuário autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Duna }
 *               author: { type: string, nullable: true, example: Frank Herbert }
 *               imge_url: { type: string, nullable: true }
 *               total_pages: { type: integer, nullable: true, example: 600 }
 *               type_book: { type: string, nullable: true, example: ficcao }
 *               status: { type: integer, nullable: true }
 *               note: { type: string, nullable: true }
 *               data_init: { type: string, format: date-time, nullable: true }
 *               data_final: { type: string, format: date-time, nullable: true }
 *     responses:
 *       201:
 *         description: Livro criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book: { $ref: '#/components/schemas/Book' }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
export async function POST(request: Request) {
  let session;
  try {
    session = await requireSession(request);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = parseBookFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (!parsed.data.title) {
    return NextResponse.json({ error: "title é obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: book, error } = await supabase
    .from("books")
    .insert({ ...parsed.data, user_id: Number(session.sub) })
    .select("*")
    .single();

  if (error || !book) {
    return NextResponse.json(
      { error: "não foi possível criar o livro" },
      { status: 500 }
    );
  }

  return NextResponse.json({ book }, { status: 201 });
}
