import { NextRequest } from "next/server";
import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/services/auth.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const user = await getCurrentUser(userId);
  return ok(user);
});
