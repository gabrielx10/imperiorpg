import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { MAPS } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { mapId?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { mapId } = body;
  if (mapId === undefined || mapId < 0 || mapId >= MAPS.length) return jsonError("Mapa invalido");

  const map = MAPS[mapId];
  if (char.level < map.minLevel) {
    return jsonError(`Nivel insuficiente. Minimo: ${map.minLevel}`, 403);
  }

  await db.update(characters).set({ mapId }).where(eq(characters.id, char.id));

  return jsonOk({ message: `Voce foi para ${map.name}!`, mapId });
};

export const config: Config = { path: "/api/change-map", method: "POST" };
