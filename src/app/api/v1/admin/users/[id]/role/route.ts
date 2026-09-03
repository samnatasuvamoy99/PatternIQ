import { NextRequest } from "next/server";
import { apiHandler, parseJson, requireAdmin } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { adminSetUserRole } from "@/services/admin-user.service";
import { AuthContext } from "@/lib/auth";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]),
});

export const PATCH = apiHandler(async (
  req: NextRequest,
  { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  requireAdmin(auth);
  const body = updateUserRoleSchema.parse(await parseJson(req));
  const updatedUser = await adminSetUserRole(params.id, body.role);
  return ok(updatedUser, `User role updated to ${body.role}`);
});
