import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { createCommentSchema } from "@/lib/validations/comment.validation";
import { createReply } from "@/services/comment.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const body = createCommentSchema.parse(await parseJson(req));
  const reply = await createReply(userId, params.id, body.content);
  return created(reply, "Reply posted");
});
