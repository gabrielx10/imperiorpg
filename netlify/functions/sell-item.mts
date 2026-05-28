import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { inventoryItems, characters } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { inventoryId?: number; sellAll?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { inventoryId, sellAll } = body;

  if (sellAll) {
    // Sell all unequipped common items
    const commonItems = await db.select().from(inventoryItems)
      .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.equipped, false)));

    let totalGold = 0;
    const toDelete: number[] = [];

    for (const inv of commonItems) {
      try {
        const item = JSON.parse(inv.itemData) as GameItem;
        if (item.rarity === "common" || item.rarity === "uncommon") {
          totalGold += item.sellValue ?? 0;
          toDelete.push(inv.id);
        }
      } catch { /* skip */ }
    }

    for (const id of toDelete) {
      await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    }

    await db.update(characters).set({ gold: char.gold + totalGold }).where(eq(characters.id, char.id));

    return jsonOk({ message: `Vendidos ${toDelete.length} itens por ${totalGold} ouro`, goldEarned: totalGold });
  }

  if (!inventoryId) return jsonError("inventoryId obrigatorio");

  const [invItem] = await db.select().from(inventoryItems)
    .where(and(eq(inventoryItems.id, inventoryId), eq(inventoryItems.characterId, char.id)))
    .limit(1);

  if (!invItem) return jsonError("Item nao encontrado", 404);
  if (invItem.equipped) return jsonError("Nao e possivel vender item equipado");

  let item: GameItem;
  try {
    item = JSON.parse(invItem.itemData) as GameItem;
  } catch {
    return jsonError("Dados corrompidos");
  }

  await db.delete(inventoryItems).where(eq(inventoryItems.id, inventoryId));
  await db.update(characters).set({ gold: char.gold + item.sellValue }).where(eq(characters.id, char.id));

  return jsonOk({ message: "Item vendido", goldEarned: item.sellValue });
};

export const config: Config = { path: "/api/sell-item", method: "POST" };
