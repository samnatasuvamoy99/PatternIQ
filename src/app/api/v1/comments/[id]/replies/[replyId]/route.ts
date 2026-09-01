import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { deleteReply } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string; replyId: string }; auth: AuthContext | null }
) => {
  const context = requireAuth(auth);
  const reply = await deleteReply(context.userId, params.id, params.replyId, context.role === "ADMIN");
  return ok(reply, "Reply deleted");
});
