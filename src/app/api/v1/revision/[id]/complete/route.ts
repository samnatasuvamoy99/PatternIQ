import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { completeRevision } from "@/services/revision.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  let score: number | undefined;
  try {
    const body = await parseJson<{ score?: number }>(req);
    score = body.score;
  } catch { /* score is optional */ }
  const revision = await completeRevision(userId, params.id, score);
  return ok(revision, "Revision completed — next one scheduled");
});
