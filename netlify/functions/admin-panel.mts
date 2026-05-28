import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters, users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char?.isAdmin) return jsonError("Apenas admin pode acessar", 403);

  if (req.method === "GET") {
    // Get all characters (admin list)
    const allChars = await db.select().from(characters).limit(100);
    return jsonOk({ characters: allChars });
  }

  if (req.method === "POST") {
    let body: { action?: string; characterId?: number; vipLevel?: number; gold?: number };
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const { action, characterId, vipLevel, gold } = body;

    if (action === "grant_vip" && characterId && vipLevel) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      await db.update(characters).set({
        vipLevel,
        vipExpiry: expiry,
      }).where(eq(characters.id, characterId));

      return jsonOk({ message: "VIP concedido" });
    }

    if (action === "add_gold" && characterId && gold) {
      const target = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
      if (!target.length) return jsonError("Personagem nao encontrado", 404);

      await db.update(characters).set({
        gold: (target[0].gold || 0) + gold,
      }).where(eq(characters.id, characterId));

      return jsonOk({ message: "Ouro adicionado" });
    }

    if (action === "toggle_admin" && characterId) {
      const target = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
      if (!target.length) return jsonError("Personagem nao encontrado", 404);

      await db.update(characters).set({
        isAdmin: !target[0].isAdmin,
      }).where(eq(characters.id, characterId));

      return jsonOk({ message: "Status admin alterado" });
    }

    return jsonError("Acao invalida");
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = { path: "/api/admin-panel", method: ["GET", "POST"] };
