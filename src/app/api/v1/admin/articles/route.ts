import { NextRequest } from "next/server";
import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminListArticles } from "@/services/article.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  return ok(await adminListArticles(status));
});
