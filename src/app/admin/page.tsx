import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SHIPMENTS_PAGE_SIZE } from "@/lib/shipment";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      include: { events: { orderBy: { createdAt: "asc" } } },
      take: SHIPMENTS_PAGE_SIZE,
    }),
    prisma.shipment.count(),
  ]);

  return (
    <AdminDashboard
      username={session.username}
      initialShipments={JSON.parse(JSON.stringify(shipments))}
      initialTotal={total}
    />
  );
}
