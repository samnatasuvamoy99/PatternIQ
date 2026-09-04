import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { toggleProblemProgress } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(
  async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
    const { userId } = requireAuth(auth);
    const body = await parseJson<{
      problemId: string;
      status?: "SOLVED" | "ATTEMPTED" | "NOT_ATTEMPTED";
    }>(req);

    const result = await toggleProblemProgress(userId, body.problemId, body.status);
    return ok(result, "Problem progress updated");
  }
);
