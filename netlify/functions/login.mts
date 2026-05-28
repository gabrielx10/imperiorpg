import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { verifyPassword, generateToken, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return jsonError("Method not allowed", 405);

    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const { username, password } = body;
    if (!username || !password) return jsonError("Username e senha sao obrigatorios");

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) return jsonError("Credenciais invalidas", 401);

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return jsonError("Credenciais invalidas", 401);
    }

    const token = generateToken();
    await db.update(users).set({ sessionToken: token }).where(eq(users.id, user.id));

    return jsonOk({ token, userId: user.id, username: user.username });
  } catch (e) {
    console.error("Login error:", e);
    return jsonError("Erro ao conectar ao servidor");
  }
};

export const config: Config = { path: "/api/login", method: "POST" };
