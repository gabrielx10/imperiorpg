import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { action } = body;

  if (action === "toggle_auto") {
    const isVip = char.vipLevel > 0 && (!char.vipExpiry || new Date(char.vipExpiry) > new Date());
    if (!isVip) return jsonError("Apenas VIP pode ativar auto-combate", 403);

    await db.update(characters).set({
      autoBattle: !char.autoBattle,
    }).where(eq(characters.id, char.id));

    return jsonOk({
      message: char.autoBattle ? "Auto-combate desativado" : "Auto-combate ativado",
      autoBattle: !char.autoBattle,
    });
  }

  return jsonError("Acao invalida");
};

export const config: Config = { path: "/api/vip-toggle", method: "POST" };
