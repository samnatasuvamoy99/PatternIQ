import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson, getPaginationParams, buildPaginationMeta } from "@/lib/handler";
import { ok, created } from "@/lib/api-response";
import { createArticleSchema } from "@/lib/validations/article.validation";
import { listPublishedArticles, createArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (req: NextRequest) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const subtopic = searchParams.get("subtopic") || undefined;
  const q = searchParams.get("q") || undefined;

  const { items, total } = await listPublishedArticles({ category, subtopic, q, page, limit, skip });
  return ok({ items, pagination: buildPaginationMeta(page, limit, total) });
});

export const POST = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const body = createArticleSchema.parse(await parseJson(req));
  const article = await createArticle(userId, body);
  return created(article, "Article draft created");
});
