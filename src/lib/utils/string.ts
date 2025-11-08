export const toSentenceCase = (str: string) => {
    if (!str) return "";
    const result = str.replace(/_/g, " ");
    return result.charAt(0).toUpperCase() + result.slice(1);
};

export const toTitleCase = (str: string) => {
    if (!str) return "";
    return str
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export function formatCurrency(value: number, locale = "id-ID", currency = "IDR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as Record<string, unknown>).seconds === "number"
  ) {
    const { seconds, nanos = 0 } = value as { seconds: number; nanos?: number };
    return new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
  }
  return null;
}

export function toDateOnly(value: unknown): string | null {
  const d = toDate(value);
  if (!d) return null;
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export function toDateTimeMinutes(value: unknown): string | null {
  const d = toDate(value);
  if (!d) return null;
  const iso = d.toISOString();
  return iso.substring(0, 16).replace("T", " "); // YYYY-MM-DD HH:MM
}

export function toDateTimeSeconds(value: unknown): string | null {
  const d = toDate(value);
  if (!d) return null;
  const iso = d.toISOString();
  return iso.substring(0, 19).replace("T", " "); // YYYY-MM-DD HH:MM:SS
}

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * NEW: Formats a Date object to the specified API string format.
 * e.g., 2025-11-05T19:51:55+07:00
 */
export function toApiISOString(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() is 0-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutes = date.getTimezoneOffset();
  const offsetSign = offsetMinutes > 0 ? "-" : "+";
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes / 60)));
  const offsetMins = pad(Math.abs(offsetMinutes % 60));

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
}