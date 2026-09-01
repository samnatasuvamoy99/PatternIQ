import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok, created } from "@/lib/api-response";
import { createProblemSchema } from "@/lib/validations/problem.validation";
import { adminListProblems, adminCreateProblem } from "@/services/problem.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  return ok(await adminListProblems());
});

export const POST = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const body = createProblemSchema.parse(await parseJson(req));
  const problem = await adminCreateProblem(body);
  return created(problem, "Problem created");
});
