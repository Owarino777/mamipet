export function safeReturnPath(value: string | null, fallback: string): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return fallback;
  const base = new URL("https://mamipet.invalid");
  try {
    const url = new URL(value, base);
    return url.origin === base.origin && url.pathname !== "/login"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
