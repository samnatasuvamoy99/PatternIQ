import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updateArticleSchema } from "@/lib/validations/article.validation";
import { getArticleBySlugOrId, updateArticle, deleteArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

// Accepts either a slug or an id in the same dynamic segment so the
// public "GET by slug" and owner "PATCH/DELETE by id" routes from the
// spec can share one Next.js route file.
export const GET = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const article = await getArticleBySlugOrId(params.id, auth?.userId);
  return ok(article);
});

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const body = updateArticleSchema.parse(await parseJson(req));
  const article = await updateArticle(userId, params.id, body);
  return ok(article, "Article updated");
});

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await deleteArticle(userId, params.id);
  return ok(result, "Article deleted");
});
