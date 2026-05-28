import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { inventoryItems } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  const items = await db.select().from(inventoryItems)
    .where(eq(inventoryItems.characterId, char.id));

  const parsed = items.map(inv => {
    try {
      return {
        inventoryId: inv.id,
        equipped: inv.equipped,
        slot: inv.slot,
        item: JSON.parse(inv.itemData) as GameItem,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return jsonOk({ inventory: parsed });
};

export const config: Config = { path: "/api/inventory" };
