import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/shipments/[id]">,
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    await prisma.shipment.delete({ where: { id } });
  } catch (error: unknown) {
    const isNotFound =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025";
    if (isNotFound) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
