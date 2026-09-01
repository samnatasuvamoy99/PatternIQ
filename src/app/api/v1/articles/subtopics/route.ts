import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getArticleSubtopics } from "@/services/article.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const subtopics = await getArticleSubtopics(category);
  return ok(subtopics);
});
