import { apiHandler, requireAuth } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { markNotificationRead } from "@/services/notification.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const notification = await markNotificationRead(userId, params.id);
  return ok(notification, "Notification marked as read");
});
