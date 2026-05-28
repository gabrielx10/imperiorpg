import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { inventoryItems, characters } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { ITEM_SLOT_MAP } from "./lib/gameData.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { inventoryId?: number; action?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { inventoryId, action } = body;
  if (!inventoryId || !action) return jsonError("inventoryId e action sao obrigatorios");
  if (!["equip", "unequip"].includes(action)) return jsonError("Acao invalida");

  const [invItem] = await db.select().from(inventoryItems)
    .where(and(eq(inventoryItems.id, inventoryId), eq(inventoryItems.characterId, char.id)))
    .limit(1);

  if (!invItem) return jsonError("Item nao encontrado", 404);

  let item: GameItem;
  try {
    item = JSON.parse(invItem.itemData) as GameItem;
  } catch {
    return jsonError("Dados de item corrompidos");
  }

  if (action === "equip") {
    const targetSlot = ITEM_SLOT_MAP[item.type];
    if (!targetSlot) return jsonError("Tipo de item invalido");

    // Handle ring slots
    let finalSlot = targetSlot;
    if (targetSlot === "ring1") {
      // Check if ring1 is taken
      const [ring1] = await db.select({ id: inventoryItems.id }).from(inventoryItems)
        .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.slot, "ring1"), eq(inventoryItems.equipped, true)))
        .limit(1);
      if (ring1) finalSlot = "ring2";
    }

    // Unequip current item in this slot
    await db.update(inventoryItems)
      .set({ equipped: false, slot: null })
      .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.slot, finalSlot), eq(inventoryItems.equipped, true)));

    // Equip this item
    await db.update(inventoryItems)
      .set({ equipped: true, slot: finalSlot })
      .where(eq(inventoryItems.id, inventoryId));

    return jsonOk({ message: "Item equipado", slot: finalSlot });
  } else {
    // Unequip
    await db.update(inventoryItems)
      .set({ equipped: false, slot: null })
      .where(eq(inventoryItems.id, inventoryId));

    return jsonOk({ message: "Item desequipado" });
  }
};

export const config: Config = { path: "/api/equip-item", method: "POST" };
