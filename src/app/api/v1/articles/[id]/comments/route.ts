import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok, created } from "@/lib/api-response";
import { createCommentSchema } from "@/lib/validations/comment.validation";
import { getArticleComments, createComment } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { params }: { params: { id: string } }) => {
  const comments = await getArticleComments(params.id);
  return ok(comments);
});

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const body = createCommentSchema.parse(await parseJson(req));
  const comment = await createComment(userId, params.id, body.content, body.parentId);
  return created(comment, "Comment posted");
});
