import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminSetUserActive } from "@/services/admin-user.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const user = await adminSetUserActive(params.id, true);
  return ok(user, "User activated");
});
