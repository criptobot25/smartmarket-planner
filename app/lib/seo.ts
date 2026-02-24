const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(rawUrl: string): string {
  const urlWithProtocol = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;

  return urlWithProtocol.endsWith("/")
    ? urlWithProtocol.slice(0, -1)
    : urlWithProtocol;
}

export function getSiteUrl(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || process.env.SITE_URL
    || process.env.VERCEL_URL
    || FALLBACK_SITE_URL;

  return new URL(normalizeSiteUrl(siteUrl));
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

export function getLanguageAlternates(path: string): Record<string, string> {
  const separator = path.includes("?") ? "&" : "?";

  return {
    "en-US": `${path}${separator}lang=en-US`,
    "pt-BR": `${path}${separator}lang=pt-BR`,
    "x-default": path,
  };
}
