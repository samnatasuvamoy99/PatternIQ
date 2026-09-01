import { NextRequest } from "next/server";
import { apiHandler, parseJson } from "@/lib/handler";
import { created } from "@/lib/api-response";
import { registerSchema } from "@/lib/validations/auth.validation";
import { registerUser } from "@/services/auth.service";

export const POST = apiHandler(async (req: NextRequest) => {
  const body = registerSchema.parse(await parseJson(req));
  const result = await registerUser(body);
  return created(result, "Account created successfully");
});
