import { NextRequest } from "next/server";
import { apiHandler, requireAdmin, parseJson } from "@/lib/handler";
import { ok, created } from "@/lib/api-response";
import { createTopicSchema } from "@/lib/validations/topic.validation";
import { adminListTopics, adminCreateTopic } from "@/services/topic.service";
import { AuthContext } from "@/lib/auth";

export const GET = apiHandler(async (_req, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  return ok(await adminListTopics());
});

export const POST = apiHandler(async (req: NextRequest, { auth }: { auth: AuthContext | null }) => {
  requireAdmin(auth);
  const body = createTopicSchema.parse(await parseJson(req));
  const topic = await adminCreateTopic(body);
  return created(topic, "Topic created");
});
