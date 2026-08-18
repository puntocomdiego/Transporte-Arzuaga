function normalizePhoneForWhatsApp(rawPhone: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("598")) return digits;
  if (digits.startsWith("0")) return `598${digits.slice(1)}`;
  return `598${digits}`;
}

export function buildTrackingUrl(origin: string, trackingNumber: string): string {
  return `${origin}/rastreo/${encodeURIComponent(trackingNumber)}`;
}

export function buildWhatsAppShareLink(params: {
  phone: string | null;
  recipientName: string;
  trackingNumber: string;
  trackingUrl: string;
}): string | null {
  const phone = params.phone ? normalizePhoneForWhatsApp(params.phone) : null;
  if (!phone) return null;

  const message = [
    `Hola ${params.recipientName}! Te enviaron un paquete por Transporte Arzuaga.`,
    `Número de rastreo: ${params.trackingNumber}`,
    `Podés seguirlo acá: ${params.trackingUrl}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
