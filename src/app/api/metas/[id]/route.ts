import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { parseMetaFields } from "@/lib/metas/fields";

function parseMetaId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/metas/{id}:
 *   get:
 *     tags: [Metas]
 *     summary: Detalhe de uma meta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Meta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta: { $ref: '#/components/schemas/Meta' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Meta não encontrada
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
  const id = parseMetaId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: meta, error } = await supabase
    .from("metas")
    .select("*")
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível buscar a meta" },
      { status: 500 }
    );
  }
  if (!meta) {
    return NextResponse.json({ error: "meta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ meta });
}

/**
 * @swagger
 * /api/metas/{id}:
 *   patch:
 *     tags: [Metas]
 *     summary: Atualiza parcialmente uma meta
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
 *               type: { type: integer, nullable: true }
 *               period: { type: integer, nullable: true }
 *               value_check: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Meta atualizada
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
 *       404:
 *         description: Meta não encontrada
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
  const id = parseMetaId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseMetaFields(body);
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
  const { data: meta, error } = await supabase
    .from("metas")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível atualizar a meta" },
      { status: 500 }
    );
  }
  if (!meta) {
    return NextResponse.json({ error: "meta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ meta });
}

/**
 * @swagger
 * /api/metas/{id}:
 *   delete:
 *     tags: [Metas]
 *     summary: Remove uma meta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removida
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
 *         description: Meta não encontrada
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
  const id = parseMetaId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: meta, error } = await supabase
    .from("metas")
    .delete()
    .eq("id", id)
    .eq("user_id", Number(session.sub))
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "não foi possível excluir a meta" },
      { status: 500 }
    );
  }
  if (!meta) {
    return NextResponse.json({ error: "meta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
