export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { apiHandler, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { z } from "zod";
import { validateEmailAddress } from "@/lib/email-validator";

const schema = z.object({
  email: z.string().min(1, "Email is required"),
});

export const POST = apiHandler(async (req: NextRequest) => {
  const body = schema.parse(await parseJson(req));
  const validation = await validateEmailAddress(body.email);
  return ok(validation, validation.isValid ? "Email domain verified" : "Email validation failed");
});
