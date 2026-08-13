import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <AdminDashboard
      username={session.username}
      initialShipments={JSON.parse(JSON.stringify(shipments))}
    />
  );
}
