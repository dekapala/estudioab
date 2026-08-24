export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export function formatPct(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value}%`;
}

export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  return (new Date(value).getTime() - Date.now()) / 86_400_000;
}
