import { NextRequest } from "next/server";
import { apiHandler, getPaginationParams, buildPaginationMeta } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { listPublicProblems } from "@/services/problem.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty") || undefined;

  const { items, total } = await listPublicProblems({ difficulty, page, limit, skip });
  return ok({ items, pagination: buildPaginationMeta(page, limit, total) });
});
