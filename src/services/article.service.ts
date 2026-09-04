import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { uniqueArticleSlug } from "@/lib/slug";
import { createNotification } from "./notification.service";
import { Prisma } from "@prisma/client";

interface ArticleInput {
  title: string; excerpt?: string; content: string; coverImage?: string;
  category: string; subtopic?: string;
}

function toArticleDto(
  article: Prisma.ArticleGetPayload<{
    include: {
      author: { select: { id: true; name: true; avatar: true } };
      _count: { select: { likes: true; comments: true } };
    };
  }>,
  userState?: { liked: boolean; bookmarked: boolean }
) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    subtopic: article.subtopic,
    coverImage: article.coverImage,
    status: article.status,
    publishedAt: article.publishedAt,
    author: article.author,
    stats: { likes: article._count.likes, comments: article._count.comments },
    userState: userState ?? { liked: false, bookmarked: false },
    content: article.content,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

const articleInclude = {
  author: { select: { id: true, name: true, avatar: true } as const },
  _count: { select: { likes: true, comments: true } as const },
};

export async function listPublishedArticles(params: {
  category?: string; subtopic?: string; q?: string; page: number; limit: number; skip: number;
}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.category) where.category = params.category;
  if (params.subtopic) where.subtopic = params.subtopic;
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { excerpt: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where, include: articleInclude, orderBy: { publishedAt: "desc" },
      skip: params.skip, take: params.limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { items: items.map((a) => toArticleDto(a)), total };
}

export async function getArticleBySlugOrId(identifier: string, userId?: string) {
  const article = await prisma.article.findFirst({
    where: { OR: [{ slug: identifier }, { id: identifier }] },
    include: articleInclude,
  });
  if (!article) throw ApiError.notFound("Article not found");

  let userState;
  if (userId) {
    const [liked, bookmarked] = await Promise.all([
      prisma.articleLike.findUnique({ where: { articleId_userId: { articleId: article.id, userId } } }),
      prisma.articleBookmark.findUnique({ where: { articleId_userId: { articleId: article.id, userId } } }),
    ]);
    userState = { liked: !!liked, bookmarked: !!bookmarked };
  }

  return toArticleDto(article, userState);
}

export function getArticleCategories() {
  return [
    "DSA", "DEVELOPMENT", "CORE_CS", "SYSTEM_DESIGN",
    "DATABASE", "DEVOPS", "GENAI", "PROGRAMMING", "OTHER",
  ];
}

export async function getArticleSubtopics(category?: string) {
  const where = category ? { category: category as never, status: "PUBLISHED" as const } : { status: "PUBLISHED" as const };
  const rows = await prisma.article.findMany({
    where, select: { subtopic: true }, distinct: ["subtopic"],
  });
  return rows.map((r) => r.subtopic).filter(Boolean);
}

export async function getLatestArticles(limit = 10) {
  const items = await prisma.article.findMany({
    where: { status: "PUBLISHED" }, include: articleInclude,
    orderBy: { publishedAt: "desc" }, take: limit,
  });
  return items.map((a) => toArticleDto(a));
}

export async function getTrendingArticles(limit = 10) {
  const items = await prisma.article.findMany({
    where: { status: "PUBLISHED" }, include: articleInclude,
    orderBy: [{ likes: { _count: "desc" } }, { publishedAt: "desc" }], take: limit,
  });
  return items.map((a) => toArticleDto(a));
}

export async function createArticle(authorId: string, input: ArticleInput) {
  const slug = await uniqueArticleSlug(input.title);
  const article = await prisma.article.create({
    data: { ...input, category: input.category as never, slug, authorId, status: "DRAFT" },
    include: articleInclude,
  });
  return toArticleDto(article);
}

async function getOwnedArticle(authorId: string, id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw ApiError.notFound("Article not found");
  if (article.authorId !== authorId) throw ApiError.forbidden("You do not own this article");
  return article;
}

export async function updateArticle(authorId: string, id: string, input: Partial<ArticleInput>) {
  const existing = await getOwnedArticle(authorId, id);
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(existing.status)) {
    throw ApiError.conflict("Only draft or changes-requested articles can be edited");
  }
  const data: Record<string, unknown> = { ...input };
  if (input.title) data.slug = await uniqueArticleSlug(input.title);

  const article = await prisma.article.update({ where: { id }, data, include: articleInclude });
  return toArticleDto(article);
}

export async function deleteArticle(authorId: string, id: string) {
  await getOwnedArticle(authorId, id);
  await prisma.article.delete({ where: { id } });
  return { message: "Article deleted" };
}

export async function submitArticle(authorId: string, id: string) {
  const existing = await getOwnedArticle(authorId, id);
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(existing.status)) {
    throw ApiError.conflict("Article is not in a submittable state");
  }
  const article = await prisma.article.update({
    where: { id }, data: { status: "SUBMITTED" }, include: articleInclude,
  });
  return toArticleDto(article);
}

export async function getMyArticles(authorId: string, status?: string) {
  const where: Record<string, unknown> = { authorId };
  if (status) where.status = status;
  const items = await prisma.article.findMany({ where, include: articleInclude, orderBy: { updatedAt: "desc" } });
  return items.map((a) => toArticleDto(a));
}

// ---- Admin ----

export interface AdminCreateArticleInput extends ArticleInput {
  status?: "DRAFT" | "PUBLISHED";
}

export async function adminCreateArticle(authorId: string, input: AdminCreateArticleInput) {
  const slug = await uniqueArticleSlug(input.title);
  const status = input.status || "PUBLISHED";
  const publishedAt = status === "PUBLISHED" ? new Date() : null;

  const article = await prisma.article.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category as never,
      subtopic: input.subtopic,
      authorId,
      status,
      publishedAt,
    },
    include: articleInclude,
  });

  return toArticleDto(article);
}

export async function adminListArticles(status?: string) {
  const where = status ? { status: status as never } : {};
  return prisma.article.findMany({
    where, include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function adminGetArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id }, include: { author: { select: { id: true, name: true, email: true } } },
  });
  if (!article) throw ApiError.notFound("Article not found");
  return article;
}

export async function adminGetPendingArticles() {
  return prisma.article.findMany({
    where: { status: "SUBMITTED" },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "asc" },
  });
}

export async function adminUpdateArticle(id: string, input: Partial<ArticleInput>) {
  await adminGetArticle(id);
  const data: Record<string, unknown> = { ...input };
  if (input.title) data.slug = await uniqueArticleSlug(input.title);
  return prisma.article.update({ where: { id }, data });
}

export async function adminDeleteArticle(id: string) {
  await adminGetArticle(id);
  await prisma.article.delete({ where: { id } });
  return { message: "Article deleted" };
}

/**
 * publishArticle business logic:
 * 1. Find article, 2. Check exists, 3. Check status,
 * 4. Update -> PUBLISHED, 5. Set publishedAt,
 * 6. Notify author, 7. Return published article.
 * (No cache to invalidate in this build — caching intentionally excluded.)
 */
export async function publishArticle(id: string) {
  const article = await adminGetArticle(id);
  if (article.status === "PUBLISHED") throw ApiError.conflict("Article is already published");

  const updated = await prisma.article.update({
    where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  await createNotification(
    article.authorId, "ARTICLE_PUBLISHED", "Your article was published",
    `"${article.title}" is now live on the platform.`, article.id
  );

  return updated;
}

export async function rejectArticle(id: string, reason?: string) {
  const article = await adminGetArticle(id);
  const updated = await prisma.article.update({ where: { id }, data: { status: "REJECTED" } });

  await createNotification(
    article.authorId, "ARTICLE_REJECTED", "Your article was rejected",
    reason || `"${article.title}" did not meet the publishing guidelines.`, article.id
  );

  return updated;
}

export async function requestArticleChanges(id: string, reason?: string) {
  const article = await adminGetArticle(id);
  const updated = await prisma.article.update({ where: { id }, data: { status: "CHANGES_REQUESTED" } });

  await createNotification(
    article.authorId, "ARTICLE_CHANGES_REQUESTED", "Changes requested on your article",
    reason || `Please revise "${article.title}" and resubmit.`, article.id
  );

  return updated;
}

export async function archiveArticle(id: string) {
  await adminGetArticle(id);
  return prisma.article.update({ where: { id }, data: { status: "ARCHIVED" } });
}
