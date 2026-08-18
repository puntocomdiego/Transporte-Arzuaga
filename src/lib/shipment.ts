export const SHIPMENTS_PAGE_SIZE = 10;

export const SHIPMENT_STATUSES = [
  "RECIBIDA",
  "EMBARCADA",
  "EN_TRANSITO",
  "EN_DESTINO",
  "ENTREGADA",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  RECIBIDA: "Recibida en agencia",
  EMBARCADA: "Embarcada",
  EN_TRANSITO: "En tránsito",
  EN_DESTINO: "En destino",
  ENTREGADA: "Entregada",
};

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `MDEO-${year}-${random}`;
}
