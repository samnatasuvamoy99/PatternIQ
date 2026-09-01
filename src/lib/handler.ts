import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";
import { fail } from "./api-response";
import { AuthContext, getAuthContext } from "./auth";

type RouteContext<P = Record<string, string>> = { params: P };

type Handler<P> = (
  req: NextRequest,
  ctx: RouteContext<P> & { auth: AuthContext | null }
) => Promise<Response>;

/**
 * Wraps a route handler with centralized error handling and
 * standardized response formatting. Mirrors the role of
 * `error.middleware.ts` in the Express version of this backend.
 */
export function apiHandler<P = Record<string, string>>(handler: Handler<P>) {
  return async (req: NextRequest, ctx: RouteContext<P>) => {
    try {
      const auth = await getAuthContext(req);
      return await handler(req, { ...ctx, auth });
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.statusCode, err.code, err.message);
      }
      if (err instanceof ZodError) {
        const message = err.errors.map((e) => e.message).join(", ");
        return fail(400, "VALIDATION_ERROR", message);
      }
      console.error("[API ERROR]", err);
      return fail(500, "INTERNAL_ERROR", "Something went wrong");
    }
  };
}

/** Throws if there is no authenticated user. Returns the auth context otherwise. */
export function requireAuth(auth: AuthContext | null): AuthContext {
  if (!auth) throw ApiError.unauthorized("Authentication required");
  return auth;
}

/** Throws unless the authenticated user is an ADMIN. */
export function requireAdmin(auth: AuthContext | null): AuthContext {
  const context = requireAuth(auth);
  if (context.role !== "ADMIN") {
    throw ApiError.forbidden("Admin access required");
  }
  return context;
}

export async function parseJson<T>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw ApiError.badRequest("Invalid JSON body");
  }
}

export function getPaginationParams(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20)
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
