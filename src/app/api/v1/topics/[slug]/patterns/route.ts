import { NextRequest } from "next/server";
import { apiHandler, getPaginationParams, buildPaginationMeta } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { listPublicPatterns } from "@/services/pattern.service";

export const GET = apiHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty") || undefined;

  const { items, total } = await listPublicPatterns({ topicSlug: params.slug, difficulty, page, limit, skip });
  return ok({ items, pagination: buildPaginationMeta(page, limit, total) });
});
