export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Allow only https: and data:image/* URLs for img src to avoid XSS / abuse. */
export function sanitizeImageUrl(url: string | undefined | null): string | undefined {
  if (url == null || typeof url !== "string" || !url.trim()) return undefined;
  const s = url.trim();
  if (s.startsWith("https://")) return s;
  if (s.startsWith("data:image/")) return s;
  return undefined;
}

