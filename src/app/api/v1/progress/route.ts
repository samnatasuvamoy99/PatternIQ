import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getProgressOverview } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const overview = await getProgressOverview(userId);
  return ok(overview);
});
