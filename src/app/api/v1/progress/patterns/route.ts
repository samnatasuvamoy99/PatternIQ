import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { listPatternProgress } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const items = await listPatternProgress(userId);
  return ok(items);
});
