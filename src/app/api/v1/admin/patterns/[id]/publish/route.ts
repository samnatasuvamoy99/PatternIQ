import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminSetPatternStatus } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const pattern = await adminSetPatternStatus(params.id, "PUBLISHED");
  return ok(pattern, "Pattern published");
});
