import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { rejectArticleSchema } from "@/lib/validations/article.validation";
import { rejectArticle } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  let reason: string | undefined;
  try { reason = rejectArticleSchema.parse(await parseJson(req)).reason; } catch { /* optional */ }
  const article = await rejectArticle(params.id, reason);
  return ok(article, "Article rejected");
});
