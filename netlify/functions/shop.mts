import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { inventoryItems, characters } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { SHOP_ITEMS, INVENTORY_MAX, generateItem } from "./lib/gameData.js";
import type { Rarity } from "./lib/gameData.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  if (req.method === "GET") {
    return jsonOk({ items: SHOP_ITEMS });
  }

  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { itemId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const shopItem = SHOP_ITEMS.find(i => i.id === body.itemId);
  if (!shopItem) return jsonError("Item nao encontrado na loja");
  if (char.gold < shopItem.price) return jsonError("Ouro insuficiente");

  // Count inventory
  const invCount = await db.select({ id: inventoryItems.id }).from(inventoryItems)
    .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.equipped, false)));

  let message = "";
  let newGold = char.gold - shopItem.price;

  if (shopItem.type === "potion") {
    const healAmount = Math.floor(char.maxHp * (shopItem.value as number) / 100);
    const newHp = Math.min(char.maxHp, char.currentHp + healAmount);
    await db.update(characters).set({ gold: newGold, currentHp: newHp }).where(eq(characters.id, char.id));
    message = `Pocao usada! HP restaurado em ${healAmount} pontos`;
  } else if (shopItem.type === "chest") {
    if (invCount.length >= INVENTORY_MAX) return jsonError("Inventario cheio");
    const item = generateItem(char.level, shopItem.rarity as Rarity);
    await db.insert(inventoryItems).values({
      characterId: char.id,
      itemData: JSON.stringify(item),
      equipped: false,
    });
    await db.update(characters).set({ gold: newGold }).where(eq(characters.id, char.id));
    message = `Bau aberto! Voce obteve: ${item.name}`;
  } else if (shopItem.type === "expansion") {
    // Just deduct gold (inventory is dynamically unlimited in this simplified version)
    await db.update(characters).set({ gold: newGold }).where(eq(characters.id, char.id));
    message = "Expansao de inventario adquirida!";
  } else {
    return jsonError("Tipo de item desconhecido");
  }

  return jsonOk({ message, newGold });
};

export const config: Config = { path: "/api/shop" };
