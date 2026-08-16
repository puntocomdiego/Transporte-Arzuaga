"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SHIPMENT_STATUSES, STATUS_LABELS, type ShipmentStatus } from "@/lib/shipment";
import { buildTrackingUrl, buildWhatsAppShareLink } from "@/lib/whatsapp";

type ShipmentEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type Shipment = {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string | null;
  recipientName: string;
  recipientPhone: string | null;
  originCity: string;
  destinationCity: string;
  status: string;
  notes: string | null;
  createdAt: string;
  events: ShipmentEvent[];
};

const emptyForm = {
  senderName: "",
  senderPhone: "",
  recipientName: "",
  recipientPhone: "",
  originCity: "",
  destinationCity: "",
  notes: "",
};

export function AdminDashboard({
  username,
  initialShipments,
}: {
  username: string;
  initialShipments: Shipment[];
}) {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<Shipment | null>(null);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    setLastCreated(null);

    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "No se pudo crear el envío");
        return;
      }
      setShipments((prev) => [data.shipment, ...prev]);
      setLastCreated(data.shipment);
      setForm(emptyForm);
    } catch {
      setCreateError("Ocurrió un error. Probá de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusUpdate(shipmentId: string, status: string, note: string) {
    const res = await fetch(`/api/admin/shipments/${shipmentId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (res.ok) {
      setShipments((prev) => prev.map((s) => (s.id === shipmentId ? data.shipment : s)));
    }
    return res.ok;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Panel de envíos</h1>
          <p className="text-sm text-zinc-500">Conectado como {username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Nuevo envío</h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nombre de quien envía"
            value={form.senderName}
            onChange={(e) => setForm({ ...form, senderName: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <input
            placeholder="Teléfono de quien envía (opcional)"
            value={form.senderPhone}
            onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <input
            required
            placeholder="Nombre del destinatario"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <input
            placeholder="Teléfono del destinatario (opcional)"
            value={form.recipientPhone}
            onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <input
            required
            placeholder="Ciudad de origen"
            value={form.originCity}
            onChange={(e) => setForm({ ...form, originCity: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <input
            required
            placeholder="Ciudad de destino"
            value={form.destinationCity}
            onChange={(e) => setForm({ ...form, destinationCity: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
          />
          <textarea
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 sm:col-span-2"
            rows={2}
          />

          {createError && <p className="text-sm text-red-600 sm:col-span-2">{createError}</p>}
          {lastCreated && (
            <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
              <p className="text-sm text-emerald-700">
                Envío creado. Número de rastreo:{" "}
                <span className="font-mono font-semibold">{lastCreated.trackingNumber}</span>
              </p>
              <WhatsAppButton shipment={lastCreated} />
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 sm:col-span-2"
          >
            {creating ? "Creando…" : "Registrar envío"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Envíos ({shipments.length})</h2>
        {shipments.length === 0 && (
          <p className="text-sm text-zinc-500">Todavía no hay envíos registrados.</p>
        )}
        {shipments.map((shipment) => (
          <ShipmentRow
            key={shipment.id}
            shipment={shipment}
            onUpdateStatus={handleStatusUpdate}
          />
        ))}
      </section>
    </div>
  );
}

function ShipmentRow({
  shipment,
  onUpdateStatus,
}: {
  shipment: Shipment;
  onUpdateStatus: (id: string, status: string, note: string) => Promise<boolean>;
}) {
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status as ShipmentStatus);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);

  async function handleUpdate() {
    setUpdating(true);
    setOk(null);
    const success = await onUpdateStatus(shipment.id, status, note);
    setOk(success);
    if (success) setNote("");
    setUpdating(false);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono font-semibold">{shipment.trackingNumber}</p>
          <p className="text-sm text-zinc-500">
            {shipment.originCity} → {shipment.destinationCity} · {shipment.recipientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white">
            {STATUS_LABELS[shipment.status as ShipmentStatus] ?? shipment.status}
          </span>
          <WhatsAppButton shipment={shipment} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
        >
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {updating ? "Guardando…" : "Actualizar estado"}
        </button>
        {ok === false && <span className="text-sm text-red-600">No se pudo actualizar</span>}
      </div>
    </div>
  );
}

function WhatsAppButton({ shipment }: { shipment: Shipment }) {
  if (!shipment.senderPhone) {
    return (
      <span
        title="Cargá el teléfono de quien envía para poder avisarle por WhatsApp"
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400"
      >
        Sin teléfono de envío
      </span>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = buildWhatsAppShareLink({
    phone: shipment.senderPhone,
    senderName: shipment.senderName,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: buildTrackingUrl(origin, shipment.trackingNumber),
  });

  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
    >
      Enviar WhatsApp
    </a>
  );
}
