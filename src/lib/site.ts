export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://ilkdates.vercel.app";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function sharePageUrl(publicId: string, origin?: string): string {
  const base = (origin ?? siteUrl()).replace(/\/$/, "");
  return `${base}/p/${publicId}`;
}
