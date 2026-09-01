import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { publishArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const article = await publishArticle(params.id);
  return ok(article, "Article published successfully");
});
