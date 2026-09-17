import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Healthcheck
 *     security: []
 *     responses:
 *       200:
 *         description: API no ar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
