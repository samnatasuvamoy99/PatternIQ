import { apiHandler } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async () => {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      patterns: {
        orderBy: { order: "asc" },
        include: {
          problems: {
            orderBy: { order: "asc" },
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  return ok(topics);
});
