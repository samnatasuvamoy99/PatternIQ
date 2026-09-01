import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminPinComment } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const context = requireAdmin(auth);
  const comment = await adminPinComment(context.userId, params.id);
  return ok(comment, "Comment pin state toggled");
});
