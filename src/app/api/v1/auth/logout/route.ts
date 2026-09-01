import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";

// Stateless JWT: logout simply instructs the client to discard tokens
// and clears any auth cookies that may have been set.
export const POST = apiHandler(async (_req: NextRequest) => {
  const response = ok({}, "Logged out successfully");
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
});
