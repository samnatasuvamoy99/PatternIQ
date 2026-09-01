import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { getLatestArticles } from "@/services/article.service";

export const GET = apiHandler(async () => ok(await getLatestArticles()));
