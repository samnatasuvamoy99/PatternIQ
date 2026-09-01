import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updateProgressStatusSchema } from "@/lib/validations/user.validation";
import { updatePatternStatus } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const body = updateProgressStatusSchema.parse(await parseJson(req));
  const progress = await updatePatternStatus(userId, params.id, body.status);
  return ok(progress, "Pattern status updated");
});
