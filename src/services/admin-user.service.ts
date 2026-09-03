import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

export async function adminListUsers(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  return prisma.user.findMany({
    where,
    select: {
      id: true, name: true, email: true, role: true, isActive: true,
      avatar: true, createdAt: true,
      _count: { select: { articles: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminGetUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, isActive: true,
      avatar: true, bio: true, createdAt: true,
      _count: { select: { articles: true, comments: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function adminSetUserActive(id: string, isActive: boolean) {
  await adminGetUser(id);
  return prisma.user.update({ where: { id }, data: { isActive } });
}

export async function adminSetUserRole(id: string, role: "STUDENT" | "ADMIN") {
  await adminGetUser(id);
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}
