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

export function formatCurrency(value: number, locale = "en-US", currency = "IDR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}