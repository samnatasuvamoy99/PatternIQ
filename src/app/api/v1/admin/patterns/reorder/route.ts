import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { reorderSchema } from "@/lib/validations/topic.validation";
import { adminReorderPatterns } from "@/services/pattern.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const body = reorderSchema.parse(await parseJson(req));
  const result = await adminReorderPatterns(body.items);
  return ok(result);
});
