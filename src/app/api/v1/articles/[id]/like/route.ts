import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { likeArticle, unlikeArticle } from "@/services/like-bookmark.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await likeArticle(userId, params.id);
  return ok(result, "Article liked");
});

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await unlikeArticle(userId, params.id);
  return ok(result, "Article unliked");
});
