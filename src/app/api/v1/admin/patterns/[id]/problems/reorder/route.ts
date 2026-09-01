import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { reorderProblemsSchema } from "@/lib/validations/problem.validation";
import { reorderPatternProblems } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const body = reorderProblemsSchema.parse(await parseJson(req));
  const result = await reorderPatternProblems(params.id, body.items);
  return ok(result);
});
