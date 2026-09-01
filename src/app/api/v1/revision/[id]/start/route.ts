import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { startRevision } from "@/services/revision.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const revision = await startRevision(userId, params.id);
  return ok(revision, "Revision started");
});
