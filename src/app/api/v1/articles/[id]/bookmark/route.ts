import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { bookmarkArticle, unbookmarkArticle } from "@/services/like-bookmark.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await bookmarkArticle(userId, params.id);
  return ok(result, "Article bookmarked");
});

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await unbookmarkArticle(userId, params.id);
  return ok(result, "Bookmark removed");
});
