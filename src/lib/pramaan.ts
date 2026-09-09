import { NextRequest } from "next/server";
import { PramaanClient } from "@anuj304/pramaan";

let pramaanInstance: PramaanClient | null = null;

export function getPramaanClient(): PramaanClient {
  if (!pramaanInstance) {
    const issuer = process.env.PRAMAAN_ISSUER || "http://localhost:4000";
    const clientId = process.env.PRAMAAN_CLIENT_ID || "";
    const clientSecret = process.env.PRAMAAN_CLIENT_SECRET;

    pramaanInstance = new PramaanClient({
      issuer,
      clientId,
      clientSecret,
    });
  }

  return pramaanInstance;
}

/**
 * Dynamically resolves the host and callback redirect URI from the incoming request/system.
 * Automatically handles Vercel deployments (e.g. https://patterniq-kappa.vercel.app),
 * custom domains, reverse proxy headers (x-forwarded-host, x-forwarded-proto),
 * and local development (http://localhost:3000).
 */
export function getPramaanRedirectUri(req: NextRequest): string {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");

  let base = "";

  if (forwardedHost) {
    const proto =
      forwardedProto ||
      (forwardedHost.includes("localhost") || forwardedHost.startsWith("127.0.0.1") ? "http" : "https");
    base = `${proto}://${forwardedHost}`;
  } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    base = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (process.env.VERCEL_URL) {
    base = `https://${process.env.VERCEL_URL}`;
  } else if (req.nextUrl.origin && req.nextUrl.origin !== "null") {
    base = req.nextUrl.origin;
  } else if (process.env.CLIENT_URL) {
    base = process.env.CLIENT_URL;
  } else {
    base = "http://localhost:3000";
  }

  // Strip trailing slashes
  base = base.replace(/\/+$/, "");

  return `${base}/api/v1/auth/pramaan/callback`;
}
