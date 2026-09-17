import { NextResponse } from "next/server";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna o usuário do token enviado
 *     responses:
 *       200:
 *         description: Usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
export async function GET(request: Request) {
  try {
    const payload = await requireSession(request);
    return NextResponse.json({
      user: {
        id: payload.sub,
        uuid: payload.uuid,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "não autenticado" }, { status: 401 });
    }
    throw err;
  }
}
