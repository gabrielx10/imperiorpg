import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { chatMessages } from "../../db/schema.js";
import { desc, eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, sanitizeMessage, jsonOk, jsonError } from "./lib/auth.js";

const CHAT_LIMIT = 60;
const MIN_MESSAGE_INTERVAL_MS = 2000;
const lastMessageTime = new Map<number, number>();

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  if (req.method === "GET") {
    const messages = await db.select().from(chatMessages)
      .orderBy(desc(chatMessages.id))
      .limit(CHAT_LIMIT);

    return jsonOk({ messages: messages.reverse() });
  }

  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Crie um personagem antes de usar o chat", 403);

  // Anti-spam
  const lastTime = lastMessageTime.get(auth.userId) ?? 0;
  const now = Date.now();
  if (now - lastTime < MIN_MESSAGE_INTERVAL_MS) return jsonError("Aguarde antes de enviar outra mensagem", 429);
  lastMessageTime.set(auth.userId, now);

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const msg = sanitizeMessage(body.message ?? "");
  if (!msg || msg.length < 1) return jsonError("Mensagem invalida");

  await db.insert(chatMessages).values({
    characterName: char.name,
    message: msg,
  });

  // Cleanup old messages
  const allMsgs = await db.select({ id: chatMessages.id }).from(chatMessages).orderBy(desc(chatMessages.id));
  if (allMsgs.length > CHAT_LIMIT * 2) {
    const toDelete = allMsgs.slice(CHAT_LIMIT * 2);
    for (const m of toDelete) {
      await db.delete(chatMessages).where(eq(chatMessages.id, m.id));
    }
  }

  return jsonOk({ message: "Mensagem enviada" }, 201);
};

export const config: Config = { path: "/api/chat" };
