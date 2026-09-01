import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { listBookmarkedArticles } from "@/services/like-bookmark.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const articles = await listBookmarkedArticles(userId);
  return ok(articles);
});
