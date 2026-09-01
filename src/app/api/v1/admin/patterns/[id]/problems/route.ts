import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { attachProblemSchema } from "@/lib/validations/problem.validation";
import { attachProblemToPattern } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const body = attachProblemSchema.parse(await parseJson(req));
  const link = await attachProblemToPattern(params.id, body.problemId, body.isCore, body.order);
  return created(link, "Problem attached to pattern");
});
