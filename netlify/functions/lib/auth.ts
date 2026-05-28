import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "../../../db/index.js";
import { users, characters } from "../../../db/schema.js";
import { eq } from "drizzle-orm";

export function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  const derived = scryptSync(password, salt, 64);
  return derived.toString("hex");
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const derived = scryptSync(password, salt, 64);
    const buf = Buffer.from(hash, "hex");
    return timingSafeEqual(derived, buf);
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return randomBytes(48).toString("hex");
}

export interface AuthResult {
  userId: number;
  username: string;
}

export async function validateAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  const [user] = await db.select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.sessionToken, token))
    .limit(1);

  return user ? { userId: user.id, username: user.username } : null;
}

export async function getCharacterByUserId(userId: number) {
  const [char] = await db.select().from(characters).where(eq(characters.userId, userId)).limit(1);
  return char ?? null;
}

export function sanitizeMessage(msg: string): string {
  return msg
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .trim()
    .slice(0, 200);
}

export function jsonOk(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}
