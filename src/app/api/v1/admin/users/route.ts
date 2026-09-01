import { NextRequest } from "next/server";
import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminListUsers } from "@/services/admin-user.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  return ok(await adminListUsers(search));
});
