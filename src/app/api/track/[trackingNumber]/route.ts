import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/track/[trackingNumber]">,
) {
  const { trackingNumber } = await ctx.params;

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  if (!shipment) {
    return NextResponse.json(
      { error: "No encontramos un envío con ese número" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    originCity: shipment.originCity,
    destinationCity: shipment.destinationCity,
    recipientName: shipment.recipientName,
    createdAt: shipment.createdAt,
    events: shipment.events.map((event) => ({
      status: event.status,
      note: event.note,
      createdAt: event.createdAt,
    })),
  });
}
