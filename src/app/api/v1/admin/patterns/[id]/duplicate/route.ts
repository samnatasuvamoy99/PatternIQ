import { apiHandler, requireAdmin } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { adminDuplicatePattern } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const pattern = await adminDuplicatePattern(params.id);
  return created(pattern, "Pattern duplicated");
});
