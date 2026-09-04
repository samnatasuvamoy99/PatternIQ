import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  role: "STUDENT" | "ADMIN";
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET === "dev_access_secret") {
    console.error("SECURITY RISK: Insecure default JWT_ACCESS_SECRET in production. Set a strong secret in environment variables.");
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === "dev_refresh_secret") {
    console.error("SECURITY RISK: Insecure default JWT_REFRESH_SECRET in production. Set a strong secret in environment variables.");
  }
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as AccessTokenPayload;
}
