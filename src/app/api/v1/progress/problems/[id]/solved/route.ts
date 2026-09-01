import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { solveProblemSchema } from "@/lib/validations/user.validation";
import { markProblemSolved } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  let body: { hintsUsed?: number } = {};
  try { body = solveProblemSchema.parse(await parseJson(req)); } catch { /* body optional */ }
  const result = await markProblemSolved(userId, params.id, body.hintsUsed || 0);
  return ok(result, "Problem marked as solved");
});
