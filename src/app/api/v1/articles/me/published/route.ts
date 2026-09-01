import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getMyArticles } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  return ok(await getMyArticles(userId, "PUBLISHED"));
});
