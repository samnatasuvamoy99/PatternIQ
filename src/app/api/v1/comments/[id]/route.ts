import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updateCommentSchema } from "@/lib/validations/comment.validation";
import { updateComment, deleteComment } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const context = requireAuth(auth);
  const body = updateCommentSchema.parse(await parseJson(req));
  const comment = await updateComment(context.userId, params.id, body.content, context.role === "ADMIN");
  return ok(comment, "Comment updated");
});

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const context = requireAuth(auth);
  const comment = await deleteComment(context.userId, params.id, context.role === "ADMIN");
  return ok(comment, "Comment deleted");
});
