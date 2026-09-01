import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updateProfileSchema } from "@/lib/validations/auth.validation";
import { updateProfile } from "@/services/auth.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const body = updateProfileSchema.parse(await parseJson(req));
  const user = await updateProfile(userId, body);
  return ok(user, "Profile updated");
});
