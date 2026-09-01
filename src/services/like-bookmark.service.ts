import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

async function assertArticleExists(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw ApiError.notFound("Article not found");
}

export async function likeArticle(userId: string, articleId: string) {
  await assertArticleExists(articleId);
  const existing = await prisma.articleLike.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });
  if (existing) throw ApiError.conflict("Article already liked");
  await prisma.articleLike.create({ data: { articleId, userId } });
  const count = await prisma.articleLike.count({ where: { articleId } });
  return { liked: true, likes: count };
}

export async function unlikeArticle(userId: string, articleId: string) {
  const existing = await prisma.articleLike.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });
  if (!existing) throw ApiError.notFound("You have not liked this article");
  await prisma.articleLike.delete({ where: { id: existing.id } });
  const count = await prisma.articleLike.count({ where: { articleId } });
  return { liked: false, likes: count };
}

export async function bookmarkArticle(userId: string, articleId: string) {
  await assertArticleExists(articleId);
  const existing = await prisma.articleBookmark.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });
  if (existing) throw ApiError.conflict("Article already bookmarked");
  await prisma.articleBookmark.create({ data: { articleId, userId } });
  return { bookmarked: true };
}

export async function unbookmarkArticle(userId: string, articleId: string) {
  const existing = await prisma.articleBookmark.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });
  if (!existing) throw ApiError.notFound("You have not bookmarked this article");
  await prisma.articleBookmark.delete({ where: { id: existing.id } });
  return { bookmarked: false };
}

export async function listBookmarkedArticles(userId: string) {
  const bookmarks = await prisma.articleBookmark.findMany({
    where: { userId },
    include: {
      article: {
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookmarks.map((b) => b.article);
}
