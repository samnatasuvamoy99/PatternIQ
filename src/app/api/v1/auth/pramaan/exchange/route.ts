export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieValue = req.cookies.get("patterniq_sso_exchange")?.value;

  if (!cookieValue) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NO_EXCHANGE_SESSION", message: "No active SSO exchange session found" },
      },
      { status: 400 }
    );
  }

  try {
    const payload = JSON.parse(Buffer.from(cookieValue, "base64").toString("utf-8"));

    const response = NextResponse.json({
      success: true,
      data: payload,
    });

    // Clear the one-time exchange cookie immediately
    response.cookies.set("patterniq_sso_exchange", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_SESSION", message: "Invalid SSO exchange session" },
      },
      { status: 400 }
    );
  }
}
