import { NextRequest } from "next/server";
import { apiHandler, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { ApiError } from "@/lib/errors";
import { refreshAccessToken } from "@/services/auth.service";

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await parseJson<{ refreshToken?: string }>(req);
  const refreshToken = body.refreshToken || req.cookies.get("refreshToken")?.value;
  if (!refreshToken) throw ApiError.badRequest("refreshToken is required");

  const result = await refreshAccessToken(refreshToken);
  return ok(result, "Token refreshed");
});
