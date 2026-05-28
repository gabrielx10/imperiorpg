import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters, inventoryItems } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { simulateBattle, calcStats } from "./lib/battle.js";
import type { EquippedStats } from "./lib/battle.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  // Check if character has VIP for manual attacks
  const isVip = char.vipLevel > 0 && (!char.vipExpiry || new Date(char.vipExpiry) > new Date());
  if (!isVip && !char.autoBattle) {
    return jsonError("Apenas VIP pode usar combate manual", 403);
  }

  // Get equipped items
  const equipped = await db.select().from(inventoryItems)
    .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.equipped, true)));

  const equippedStats: EquippedStats = { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 };
  for (const inv of equipped) {
    try {
      const item = JSON.parse(inv.itemData) as GameItem;
      equippedStats.damage += item.damage ?? 0;
      equippedStats.defense += item.defense ?? 0;
      equippedStats.hp += item.hp ?? 0;
      equippedStats.crit += item.crit ?? 0;
      equippedStats.luck += item.luck ?? 0;
    } catch { }
  }

  const result = simulateBattle(char, equippedStats, 1, 1);
  const stats = calcStats({ ...char, level: result.newLevel, currentHp: result.newCurrentHp, maxHp: result.newCurrentHp }, equippedStats);

  // Update character (no XP/Gold for manual attacks, just simulation)
  await db.update(characters).set({
    currentHp: result.newCurrentHp,
    maxHp: stats.totalMaxHp,
    lastOnline: new Date(),
  }).where(eq(characters.id, char.id));

  return jsonOk({
    result: {
      monsterName: result.monsterName,
      win: result.win,
      playerDamageDealt: result.playerDamageDealt,
      playerDamageReceived: result.playerDamageReceived,
    },
    character: {
      currentHp: result.newCurrentHp,
      maxHp: stats.totalMaxHp,
    },
  });
};

export const config: Config = { path: "/api/manual-attack", method: "POST" };
