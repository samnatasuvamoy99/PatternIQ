import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { submitArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const article = await submitArticle(userId, params.id);
  return ok(article, "Article submitted for review");
});
