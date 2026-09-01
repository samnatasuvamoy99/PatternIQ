import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { globalSearch } from "@/services/search.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const results = await globalSearch(q);
  return ok(results);
});
