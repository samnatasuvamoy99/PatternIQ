import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getPatternProgressDetail } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const progress = await getPatternProgressDetail(userId, params.id);
  return ok(progress);
});
