import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq, or } from "drizzle-orm";
import { generateSalt, hashPassword, generateToken, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  try {
    if (req.method !== "POST") return jsonError("Method not allowed", 405);

    let body: { username?: string; email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const { username, email, password } = body;

    if (!username || !email || !password) return jsonError("Todos os campos sao obrigatorios");
    if (username.length < 3 || username.length > 20) return jsonError("Username deve ter 3-20 caracteres");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return jsonError("Username so pode conter letras, numeros e _");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Email invalido");
    if (password.length < 6) return jsonError("Senha deve ter no minimo 6 caracteres");

    const existing = await db.select({ id: users.id }).from(users)
      .where(or(eq(users.username, username), eq(users.email, email.toLowerCase())))
      .limit(1);

    if (existing.length > 0) return jsonError("Username ou email ja em uso", 409);

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const token = generateToken();

    const [user] = await db.insert(users).values({
      username,
      email: email.toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
      sessionToken: token,
    }).returning({ id: users.id, username: users.username });

    return jsonOk({ token, userId: user.id, username: user.username }, 201);
  } catch (e) {
    console.error("Register error:", e);
    return jsonError("Erro ao conectar ao servidor");
  }
};

export const config: Config = { path: "/api/register", method: "POST" };
