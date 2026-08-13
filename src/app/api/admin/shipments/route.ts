import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTrackingNumber } from "@/lib/shipment";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ shipments });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const senderName = typeof body?.senderName === "string" ? body.senderName.trim() : "";
  const senderPhone = typeof body?.senderPhone === "string" ? body.senderPhone.trim() : "";
  const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim() : "";
  const recipientPhone = typeof body?.recipientPhone === "string" ? body.recipientPhone.trim() : "";
  const originCity = typeof body?.originCity === "string" ? body.originCity.trim() : "";
  const destinationCity = typeof body?.destinationCity === "string" ? body.destinationCity.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!senderName || !recipientName || !originCity || !destinationCity) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios del envío" },
      { status: 400 },
    );
  }

  let shipment = null;
  for (let attempt = 0; attempt < 5 && !shipment; attempt++) {
    const trackingNumber = generateTrackingNumber();
    try {
      shipment = await prisma.shipment.create({
        data: {
          trackingNumber,
          senderName,
          senderPhone: senderPhone || null,
          recipientName,
          recipientPhone: recipientPhone || null,
          originCity,
          destinationCity,
          notes: notes || null,
          status: "RECIBIDA",
          events: {
            create: { status: "RECIBIDA", note: "Envío registrado en agencia" },
          },
        },
        include: { events: true },
      });
    } catch (error: unknown) {
      const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";
      if (!isUniqueViolation) throw error;
    }
  }

  if (!shipment) {
    return NextResponse.json(
      { error: "No se pudo generar un número de envío único, intentá de nuevo" },
      { status: 500 },
    );
  }

  return NextResponse.json({ shipment }, { status: 201 });
}
