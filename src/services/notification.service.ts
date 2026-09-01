import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string, type: NotificationType, title: string, message: string, referenceId?: string
) {
  return prisma.notification.create({ data: { userId, type, title, message, referenceId } });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) throw ApiError.notFound("Notification not found");
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return { message: "All notifications marked as read" };
}
