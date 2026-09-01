import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { reorderSchema } from "@/lib/validations/topic.validation";
import { adminReorderTopics } from "@/services/topic.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const body = reorderSchema.parse(await parseJson(req));
  const result = await adminReorderTopics(body.items);
  return ok(result);
});
