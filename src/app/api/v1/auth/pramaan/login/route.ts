export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getPramaanClient, getPramaanRedirectUri } from "@/lib/pramaan";

export async function GET(req: NextRequest) {
  try {
    const pramaan = getPramaanClient();
    const searchParams = req.nextUrl.searchParams;
    const redirectTarget = searchParams.get("redirect") || "/dashboard";

    const dynamicRedirectUri = getPramaanRedirectUri(req);

    const auth = await pramaan.createAuthorizationRequest({
      scope: ["openid", "profile", "email"],
      redirectUri: dynamicRedirectUri,
    });

    const txPayload = JSON.stringify({
      transaction: auth.transaction,
      redirect: redirectTarget,
    });

    const response = NextResponse.redirect(auth.url);

    // Save transaction state in a short-lived HTTP-only cookie (10 mins)
    response.cookies.set("pramaan_oauth_tx", Buffer.from(txPayload).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error: any) {
    console.error("Failed to initiate Pramaan OAuth:", error);
    let origin: string;
    try {
      origin = getPramaanRedirectUri(req).replace(/\/api\/v1\/auth\/pramaan\/callback$/, "");
    } catch {
      origin = req.nextUrl.origin || "http://localhost:3000";
    }

    const message =
      error?.message?.includes("not configured")
        ? "Pramaan OAuth is not configured yet. Please add the valid issuer and credentials."
        : "Unable to connect to Pramaan service. Please try again later.";

    const errorMessage = encodeURIComponent(message);
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }
}
