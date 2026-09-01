import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminGetPendingArticles } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  return ok(await adminGetPendingArticles());
});
