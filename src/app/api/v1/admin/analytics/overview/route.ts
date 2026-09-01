import { apiHandler, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getAdminDashboard } from "@/services/dashboard.service";
import { AuthContext } from "@/lib/auth";

// Overview analytics reuses the admin dashboard aggregation.
// Additional slices (users/topics/patterns/problems/articles) can be
// added the same way as the platform grows, each as its own service query.
export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  return ok(await getAdminDashboard());
});
