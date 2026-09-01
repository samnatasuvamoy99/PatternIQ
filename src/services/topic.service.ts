import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { uniqueTopicSlug } from "@/lib/slug";

export async function listPublicTopics() {
  return prisma.topic.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { patterns: true } } },
  });
}

export async function getTopicBySlug(slug: string) {
  const topic = await prisma.topic.findFirst({
    where: { slug, published: true },
    include: {
      patterns: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: {
          id: true, slug: true, name: true, number: true,
          difficulty: true, importance: true, shortDescription: true,
        },
      },
    },
  });
  if (!topic) throw ApiError.notFound("Topic not found");
  return topic;
}

// ---- Admin ----

export async function adminListTopics() {
  return prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { patterns: true } } },
  });
}

export async function adminGetTopic(id: string) {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw ApiError.notFound("Topic not found");
  return topic;
}

export async function adminCreateTopic(data: {
  name: string; description?: string; icon?: string; order?: number; published?: boolean;
}) {
  const slug = await uniqueTopicSlug(data.name);
  return prisma.topic.create({ data: { ...data, slug } });
}

export async function adminUpdateTopic(id: string, data: Partial<{
  name: string; description?: string; icon?: string; order?: number; published?: boolean;
}>) {
  await adminGetTopic(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.name) updateData.slug = await uniqueTopicSlug(data.name);
  return prisma.topic.update({ where: { id }, data: updateData });
}

export async function adminDeleteTopic(id: string) {
  await adminGetTopic(id);
  const patternCount = await prisma.pattern.count({ where: { topicId: id } });
  if (patternCount > 0) {
    throw ApiError.conflict(
      "Cannot delete a topic that still has patterns attached",
      "TOPIC_HAS_PATTERNS"
    );
  }
  await prisma.topic.delete({ where: { id } });
  return { message: "Topic deleted" };
}

export async function adminReorderTopics(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.topic.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );
  return { message: "Topics reordered" };
}

export async function adminTogglePublish(id: string) {
  const topic = await adminGetTopic(id);
  return prisma.topic.update({ where: { id }, data: { published: !topic.published } });
}
