import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { moderationLogSchema } from "@/lib/validations/comment.validation";
import { adminDeleteComment } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const DELETE = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const context = requireAdmin(auth);
  let reason: string | undefined;
  try { reason = moderationLogSchema.parse(await parseJson(req)).reason; } catch { /* optional */ }
  const comment = await adminDeleteComment(context.userId, params.id, reason);
  return ok(comment, "Comment deleted");
});
