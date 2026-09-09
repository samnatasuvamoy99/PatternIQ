export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getPramaanClient, getPramaanRedirectUri } from "@/lib/pramaan";
import { handlePramaanUser } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  const dynamicRedirectUri = getPramaanRedirectUri(req);
  const origin = dynamicRedirectUri.replace(/\/api\/v1\/auth\/pramaan\/callback$/, "");
  const searchParams = req.nextUrl.searchParams;

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (error) {
    console.error("Pramaan OAuth provider error:", error, errorDescription);
    const message = encodeURIComponent("Authentication was cancelled or failed. Please try again.");
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/login?error=Invalid+authentication+request.+Please+try+again.`);
  }

  const cookieTx = req.cookies.get("pramaan_oauth_tx")?.value;
  if (!cookieTx) {
    return NextResponse.redirect(`${origin}/login?error=Authentication+session+expired.+Please+try+again.`);
  }

  let txData: { transaction: any; redirect?: string };
  try {
    txData = JSON.parse(Buffer.from(cookieTx, "base64").toString("utf-8"));
  } catch {
    return NextResponse.redirect(`${origin}/login?error=Authentication+session+invalid.+Please+try+again.`);
  }

  try {
    const pramaan = getPramaanClient();
    const tokens = await pramaan.handleCallback({
      code,
      state,
      transaction: txData.transaction,
      redirectUri: dynamicRedirectUri,
    });

    let userInfo: any = tokens.claims;
    try {
      if (tokens.accessToken) {
        userInfo = await pramaan.getUserInfo(tokens.accessToken);
      }
    } catch (uiErr) {
      console.warn("Failed to fetch /userinfo, falling back to claims:", uiErr);
    }

    const email = userInfo?.email || (tokens.claims as any)?.email;
    if (!email) {
      return NextResponse.redirect(
        `${origin}/login?error=Unable+to+retrieve+email+address+from+your+account.`
      );
    }

    const name =
      userInfo?.name ||
      (tokens.claims as any)?.name ||
      userInfo?.preferred_username ||
      email.split("@")[0];

    const avatar = userInfo?.picture || (tokens.claims as any)?.picture || null;

    const authResult = await handlePramaanUser({
      email,
      name,
      avatar,
    });

    const exchangePayload = {
      user: authResult.user,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      redirect: txData.redirect || "/dashboard",
    };

    const response = NextResponse.redirect(`${origin}/auth/callback`);

    // Set short-lived exchange cookie (valid for 60 seconds)
    response.cookies.set("patterniq_sso_exchange", Buffer.from(JSON.stringify(exchangePayload)).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });

    // Clear transaction cookie
    response.cookies.set("pramaan_oauth_tx", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("Pramaan OAuth callback failed:", err);
    const genericMessage = encodeURIComponent(
      "Unable to complete sign in with Pramaan. Please try again."
    );
    const response = NextResponse.redirect(`${origin}/login?error=${genericMessage}`);
    response.cookies.set("pramaan_oauth_tx", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}
