import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isShipmentStatus } from "@/lib/shipment";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/shipments/[id]/events">,
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!isShipmentStatus(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      status,
      events: { create: { status, note: note || null } },
    },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ shipment: updated });
}
