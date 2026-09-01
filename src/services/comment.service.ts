import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { createNotification } from "./notification.service";

const commentInclude = {
  user: { select: { id: true, name: true, avatar: true, role: true } },
  replies: {
    where: { status: { not: "DELETED" as const } },
    include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getArticleComments(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw ApiError.notFound("Article not found");

  return prisma.articleComment.findMany({
    where: { articleId, parentId: null, status: { not: "DELETED" } },
    include: commentInclude,
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function createComment(
  userId: string, articleId: string, content: string, parentId?: string
) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw ApiError.notFound("Article not found");
  if (article.status !== "PUBLISHED") {
    throw ApiError.conflict("Comments are only allowed on published articles");
  }

  let parentOwnerId: string | null = null;
  if (parentId) {
    const parent = await prisma.articleComment.findUnique({ where: { id: parentId } });
    if (!parent || parent.articleId !== articleId) throw ApiError.notFound("Parent comment not found");
    parentOwnerId = parent.userId;
  }

  const comment = await prisma.articleComment.create({
    data: { userId, articleId, content, parentId },
    include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
  });

  if (parentOwnerId && parentOwnerId !== userId) {
    const isAdminReply = (await prisma.user.findUnique({ where: { id: userId } }))?.role === "ADMIN";
    await createNotification(
      parentOwnerId,
      isAdminReply ? "ADMIN_REPLY" : "COMMENT_REPLY",
      isAdminReply ? "Admin replied to your comment" : "Someone replied to your comment",
      content.slice(0, 140),
      comment.id
    );
  }

  return comment;
}

async function getOwnedComment(userId: string, id: string, isAdmin: boolean) {
  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) throw ApiError.notFound("Comment not found");
  if (comment.userId !== userId && !isAdmin) throw ApiError.forbidden("You cannot modify this comment");
  return comment;
}

export async function updateComment(userId: string, id: string, content: string, isAdmin = false) {
  await getOwnedComment(userId, id, isAdmin);
  return prisma.articleComment.update({ where: { id }, data: { content } });
}

export async function deleteComment(userId: string, id: string, isAdmin = false) {
  await getOwnedComment(userId, id, isAdmin);
  return prisma.articleComment.update({ where: { id }, data: { status: "DELETED" } });
}

export async function createReply(userId: string, commentId: string, content: string) {
  const parent = await prisma.articleComment.findUnique({ where: { id: commentId } });
  if (!parent) throw ApiError.notFound("Comment not found");
  return createComment(userId, parent.articleId, content, commentId);
}

export async function deleteReply(userId: string, commentId: string, replyId: string, isAdmin = false) {
  const reply = await prisma.articleComment.findUnique({ where: { id: replyId } });
  if (!reply || reply.parentId !== commentId) throw ApiError.notFound("Reply not found");
  if (reply.userId !== userId && !isAdmin) throw ApiError.forbidden("You cannot delete this reply");
  return prisma.articleComment.update({ where: { id: replyId }, data: { status: "DELETED" } });
}

// ---- Admin moderation ----

export async function adminListComments() {
  return prisma.articleComment.findMany({
    where: { status: { not: "DELETED" } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      article: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function adminReplyToComment(adminId: string, commentId: string, content: string) {
  return createReply(adminId, commentId, content);
}

async function logModeration(adminId: string, commentId: string, action: string, reason?: string) {
  await prisma.commentModerationLog.create({ data: { adminId, commentId, action, reason } });
}

export async function adminPinComment(adminId: string, id: string) {
  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) throw ApiError.notFound("Comment not found");
  const updated = await prisma.articleComment.update({ where: { id }, data: { pinned: !comment.pinned } });
  await logModeration(adminId, id, updated.pinned ? "PIN" : "UNPIN");
  return updated;
}

export async function adminHideComment(adminId: string, id: string, reason?: string) {
  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) throw ApiError.notFound("Comment not found");
  const nextStatus = comment.status === "HIDDEN" ? "VISIBLE" : "HIDDEN";
  const updated = await prisma.articleComment.update({ where: { id }, data: { status: nextStatus } });
  await logModeration(adminId, id, nextStatus, reason);
  return updated;
}

export async function adminDeleteComment(adminId: string, id: string, reason?: string) {
  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) throw ApiError.notFound("Comment not found");
  const updated = await prisma.articleComment.update({ where: { id }, data: { status: "DELETED" } });
  await logModeration(adminId, id, "DELETE", reason);
  return updated;
}
