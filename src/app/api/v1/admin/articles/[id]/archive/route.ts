import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { archiveArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

const handler = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const article = await archiveArticle(params.id);
  return ok(article, "Article archived");
});

export const POST = handler;
export const PATCH = handler;

