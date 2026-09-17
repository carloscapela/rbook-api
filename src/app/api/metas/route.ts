import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { parseMetaFields } from "@/lib/metas/fields";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @swagger
 * /api/metas:
 *   get:
 *     tags: [Metas]
 *     summary: Lista as metas do usuário autenticado
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
 *                 metas: { type: array, items: { $ref: '#/components/schemas/Meta' } }
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
    .from("metas")
    .select("*", { count: "exact" })
    .eq("user_id", Number(session.sub))
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "não foi possível listar as metas" },
      { status: 500 }
    );
  }

  return NextResponse.json({ metas: data, total: count, limit, offset });
}

/**
 * @swagger
 * /api/metas:
 *   post:
 *     tags: [Metas]
 *     summary: Cria uma meta para o usuário autenticado
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: integer, nullable: true, example: 1 }
 *               period: { type: integer, nullable: true, example: 30 }
 *               value_check: { type: string, nullable: true, example: "10 livros" }
 *     responses:
 *       201:
 *         description: Meta criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta: { $ref: '#/components/schemas/Meta' }
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
  const parsed = parseMetaFields(body ?? {});
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: meta, error } = await supabase
    .from("metas")
    .insert({ ...parsed.data, user_id: Number(session.sub) })
    .select("*")
    .single();

  if (error || !meta) {
    return NextResponse.json(
      { error: "não foi possível criar a meta" },
      { status: 500 }
    );
  }

  return NextResponse.json({ meta }, { status: 201 });
}
