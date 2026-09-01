import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { listPublicTopics } from "@/services/topic.service";

export const GET = apiHandler(async () => {
  const topics = await listPublicTopics();
  return ok(topics);
});
