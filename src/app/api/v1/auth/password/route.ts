import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updatePasswordSchema } from "@/lib/validations/auth.validation";
import { changePassword } from "@/services/auth.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const body = updatePasswordSchema.parse(await parseJson(req));
  const result = await changePassword(userId, body.currentPassword, body.newPassword);
  return ok(result, "Password updated");
});
