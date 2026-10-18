/** wa.me link from a stored WhatsApp number (digits with country code; spaces and "+" tolerated). */
export function whatsappUrl(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}
