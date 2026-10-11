/** Only allow redirects to our own pages, e.g. /sell/new (never other websites). */
export function safeNext(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/";
}
