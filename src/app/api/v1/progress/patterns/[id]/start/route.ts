import { apiHandler, requireAuth } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { startPattern } from "@/services/progress.service";
import { AuthContext } from "@/lib/auth";

export const POST = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const progress = await startPattern(userId, params.id);
  return created(progress, "Pattern started");
});
