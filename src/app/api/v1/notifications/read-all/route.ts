import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { markAllNotificationsRead } from "@/services/notification.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  const { userId } = requireAuth(auth);
  const result = await markAllNotificationsRead(userId);
  return ok(result);
});
