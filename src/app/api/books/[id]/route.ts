import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { parseBookFields } from "@/lib/books/fields";

function parseBookId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Detalhe de um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Livro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book: { $ref: '#/components/schemas/Book' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     tags: [Books]
 *     summary: Atualiza parcialmente um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string, nullable: true }
 *               imge_url: { type: string, nullable: true }
 *               total_pages: { type: integer, nullable: true }
 *               type_book: { type: string, nullable: true }
 *               status: { type: integer, nullable: true }
 *               note: { type: string, nullable: true }
 *               data_init: { type: string, format: date-time, nullable: true }
 *               data_final: { type: string, format: date-time, nullable: true }
 *     responses:
 *       200:
 *         description: Livro atualizado
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
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Remove um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
