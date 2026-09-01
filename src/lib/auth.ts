import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";

export interface AuthContext {
  userId: string;
  role: "STUDENT" | "ADMIN";
}

/**
 * Reads the JWT access token from either the Authorization header
 * (Bearer <token>) or the "accessToken" cookie, verifies it, and
 * returns the decoded auth context. Returns null if absent/invalid
 * rather than throwing — routes decide whether auth is required via
 * requireAuth() / requireAdmin() in handler.ts.
 */
export async function getAuthContext(
  req: NextRequest
): Promise<AuthContext | null> {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
