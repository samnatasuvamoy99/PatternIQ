import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { detachProblemFromPattern } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string; problemId: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const result = await detachProblemFromPattern(params.id, params.problemId);
  return ok(result);
});
