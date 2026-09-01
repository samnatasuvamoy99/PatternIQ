import { NextRequest } from "next/server";
import { apiHandler, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { loginSchema } from "@/lib/validations/auth.validation";
import { loginUser } from "@/services/auth.service";

export const POST = apiHandler(async (req: NextRequest) => {
  const body = loginSchema.parse(await parseJson(req));
  const result = await loginUser(body);
  return ok(result, "Logged in successfully");
});
