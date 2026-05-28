import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters, inventoryItems, battleHistory, events } from "../../db/schema.js";
import { eq, and, gt, lt, desc } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { MAPS, INVENTORY_MAX, getPlayerPower, xpToNextLevel } from "./lib/gameData.js";
import { simulateBattle, calcStats } from "./lib/battle.js";
import type { EquippedStats } from "./lib/battle.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

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
    } catch { /* skip */ }
  }

  // Get active events
  const now = new Date();
  const activeEvents = await db.select().from(events)
    .where(and(eq(events.active, true), lt(events.startTime, now), gt(events.endTime, now)));

  let xpMult = 1, goldMult = 1;
  for (const evt of activeEvents) {
    if (evt.type === "xp_boost") xpMult *= evt.multiplier;
    if (evt.type === "gold_boost") goldMult *= evt.multiplier;
    if (evt.type === "double_drop") xpMult *= 1.5;
  }

  const mapData = MAPS[char.mapId] ?? MAPS[0];

  const result = simulateBattle(char, equippedStats, xpMult * mapData.xpMult, goldMult * mapData.goldMult);

  // Count inventory
  const invCount = await db.select({ id: inventoryItems.id }).from(inventoryItems)
    .where(and(eq(inventoryItems.characterId, char.id), eq(inventoryItems.equipped, false)));

  let droppedItemData: GameItem | null = null;
  if (result.droppedItem && invCount.length < INVENTORY_MAX) {
    await db.insert(inventoryItems).values({
      characterId: char.id,
      itemData: JSON.stringify(result.droppedItem),
      equipped: false,
      slot: null,
    });
    droppedItemData = result.droppedItem;
  }

  // Update character
  const newStats = calcStats({ ...char, level: result.newLevel, currentHp: result.newCurrentHp, maxHp: result.newCurrentHp }, equippedStats);

  await db.update(characters).set({
    xp: result.newXp,
    level: result.newLevel,
    gold: result.newGold,
    currentHp: result.newCurrentHp,
    maxHp: newStats.totalMaxHp,
    bonusPoints: result.bonusPoints,
    lastOnline: now,
  }).where(eq(characters.id, char.id));

  // Store battle history (keep last 20)
  await db.insert(battleHistory).values({
    characterId: char.id,
    monsterName: result.monsterName,
    result: result.win ? "win" : "lose",
    xpGained: result.xpGained,
    goldGained: result.goldGained,
    itemDropped: droppedItemData ? droppedItemData.name : null,
  });

  // Cleanup old battle history
  const allHistory = await db.select({ id: battleHistory.id }).from(battleHistory)
    .where(eq(battleHistory.characterId, char.id))
    .orderBy(desc(battleHistory.id));

  if (allHistory.length > 20) {
    const toDelete = allHistory.slice(20).map(h => h.id);
    for (const id of toDelete) {
      await db.delete(battleHistory).where(eq(battleHistory.id, id));
    }
  }

  const power = getPlayerPower(result.newLevel, char.resetCount, newStats.totalDamage, newStats.totalDefense, newStats.totalMaxHp);

  return jsonOk({
    result: {
      monsterName: result.monsterName,
      win: result.win,
      playerDamageDealt: result.playerDamageDealt,
      playerDamageReceived: result.playerDamageReceived,
      xpGained: result.xpGained,
      goldGained: result.goldGained,
      droppedItem: droppedItemData,
      leveledUp: result.leveledUp,
    },
    character: {
      level: result.newLevel,
      xp: result.newXp,
      gold: result.newGold,
      currentHp: result.newCurrentHp,
      maxHp: newStats.totalMaxHp,
      bonusPoints: result.bonusPoints,
      xpRequired: xpToNextLevel(result.newLevel),
      power,
    },
    activeEvents: activeEvents.map(e => ({ name: e.name, type: e.type, multiplier: e.multiplier })),
  });
};

export const config: Config = { path: "/api/battle-tick", method: "POST" };
