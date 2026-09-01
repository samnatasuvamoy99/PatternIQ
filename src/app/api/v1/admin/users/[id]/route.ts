import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminGetUser } from "@/services/admin-user.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  return ok(await adminGetUser(params.id));
});
