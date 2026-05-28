import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { MAX_LEVEL } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  if (char.level < MAX_LEVEL) {
    return jsonError(`Reset so disponivel no nivel ${MAX_LEVEL}`, 403);
  }

  const newReset = char.resetCount + 1;

  await db.update(characters).set({
    level: 1,
    xp: 0,
    resetCount: newReset,
    mapId: 0,
    bonusPoints: char.bonusPoints + 10,
    currentHp: 100,
    maxHp: 100,
  }).where(eq(characters.id, char.id));

  return jsonOk({
    message: `Reset ${newReset} realizado! Voce ganhou 10 pontos de bônus permanentes.`,
    resetCount: newReset,
  });
};

export const config: Config = { path: "/api/reset-character", method: "POST" };
