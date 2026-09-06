import { NextRequest } from "next/server";
import { apiHandler, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { ApiError } from "@/lib/errors";

const adminRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  adminKey: z.string().min(1, "Administrator security key is required"),
});

export const POST = apiHandler(async (req: NextRequest) => {
  const body = adminRegisterSchema.parse(await parseJson(req));

  const allowedEmail = (process.env.ADMIN_EMAIL || "suvamoyadmin907@gmail.com").toLowerCase();
  if (body.email.toLowerCase() !== allowedEmail) {
    throw ApiError.forbidden(
      `Admin registration is restricted. Only the designated master admin email (${allowedEmail}) is authorized to register as an administrator.`,
      "UNAUTHORIZED_ADMIN_EMAIL"
    );
  }

  const validKey = process.env.ADMIN_INVITE_KEY || "PatternIQ_MasterAdmin_SecretKey_2026!#";
  if (!body.adminKey || body.adminKey !== validKey) {
    throw ApiError.forbidden("Invalid administrator security key", "INVALID_ADMIN_KEY");
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const existingUser = await prisma.user.findUnique({ where: { email: body.email } });

  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");
  }

  if (existingAdmin) {
    throw ApiError.forbidden(
      "An administrator account has already been registered for this platform. Public admin registration is disabled.",
      "ADMIN_ALREADY_INITIALIZED"
    );
  }

  const passwordHash = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: "ADMIN",
    },
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  return ok(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    },
    "Administrator registered successfully"
  );
});
