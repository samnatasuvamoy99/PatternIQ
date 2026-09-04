import { NextRequest } from "next/server";
import { apiHandler, parseJson, requireAdmin } from "@/lib/handler";
import { created, ok } from "@/lib/api-response";
import { adminListArticles, adminCreateArticle } from "@/services/article.service";
import { adminCreateArticleSchema } from "@/lib/validations/article.validation";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  return ok(await adminListArticles(status));
});

export const POST = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const body = adminCreateArticleSchema.parse(await parseJson(req));
  const article = await adminCreateArticle(auth!.userId, body);
  return created(article, "Article created successfully");
});
