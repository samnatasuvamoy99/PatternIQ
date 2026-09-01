import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getAdminDashboard } from "@/services/dashboard.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const dashboard = await getAdminDashboard();
  return ok(dashboard);
});
