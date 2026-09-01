import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { createCommentSchema } from "@/lib/validations/comment.validation";
import { adminReplyToComment } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const context = requireAdmin(auth);
  const body = createCommentSchema.parse(await parseJson(req));
  const reply = await adminReplyToComment(context.userId, params.id, body.content);
  return created(reply, "Official reply posted");
});
