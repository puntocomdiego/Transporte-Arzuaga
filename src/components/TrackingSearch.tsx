"use client";

import { useState, type FormEvent } from "react";
import { STATUS_LABELS, isShipmentStatus, type ShipmentStatus } from "@/lib/shipment";

type TrackEvent = {
  status: string;
  note: string | null;
  createdAt: string;
};

type TrackResult = {
  trackingNumber: string;
  status: string;
  originCity: string;
  destinationCity: string;
  recipientName: string;
  createdAt: string;
  events: TrackEvent[];
};

export function TrackingSearch() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trackingNumber = value.trim();
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackingNumber)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo consultar el envío");
        return;
      }
      setResult(data);
    } catch {
      setError("Ocurrió un error al consultar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej: MDEO-2026-000123"
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-base outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Buscando…" : "Rastrear"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Envío</p>
              <p className="font-mono text-lg font-semibold">{result.trackingNumber}</p>
            </div>
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white">
              {isShipmentStatus(result.status)
                ? STATUS_LABELS[result.status as ShipmentStatus]
                : result.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-zinc-600">
            {result.originCity} → {result.destinationCity} · Destinatario: {result.recipientName}
          </p>

          <ol className="mt-5 space-y-4 border-l border-zinc-200 pl-4">
            {result.events.map((ev, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-900" />
                <p className="font-medium">
                  {isShipmentStatus(ev.status) ? STATUS_LABELS[ev.status as ShipmentStatus] : ev.status}
                </p>
                {ev.note && <p className="text-sm text-zinc-500">{ev.note}</p>}
                <p className="text-xs text-zinc-400">
                  {new Date(ev.createdAt).toLocaleString("es-UY")}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
