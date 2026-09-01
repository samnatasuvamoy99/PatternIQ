import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getTodaysRevisions } from "@/services/revision.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const items = await getTodaysRevisions(userId);
  return ok(items);
});
