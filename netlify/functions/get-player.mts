import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters, inventoryItems, guilds, guildMembers, events } from "../../db/schema.js";
import { eq, and, gt, lt } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import {
  MAPS, OFFLINE_MAX_SECONDS, BATTLE_INTERVAL_SECONDS,
  getPlayerPower, xpToNextLevel,
} from "./lib/gameData.js";
import { simulateBattle, calcStats } from "./lib/battle.js";
import type { EquippedStats } from "./lib/battle.js";
import type { GameItem } from "./lib/gameData.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonOk({ character: null });

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

  // Offline progress
  const now = new Date();
  const lastOnline = char.lastOnline ? new Date(char.lastOnline) : now;
  const secondsOffline = Math.min(
    OFFLINE_MAX_SECONDS,
    Math.floor((now.getTime() - lastOnline.getTime()) / 1000)
  );

  let offlineBattles = 0;
  let offlineXp = 0;
  let offlineGold = 0;
  let offlineLevels = 0;

  if (secondsOffline > BATTLE_INTERVAL_SECONDS * 2) {
    offlineBattles = Math.floor(secondsOffline / BATTLE_INTERVAL_SECONDS);

    // Get active events
    const activeEvents = await db.select().from(events)
      .where(and(eq(events.active, true), lt(events.startTime, now), gt(events.endTime, now)));

    let xpMult = 1, goldMult = 1;
    for (const evt of activeEvents) {
      if (evt.type === "xp_boost") xpMult *= evt.multiplier;
      if (evt.type === "gold_boost") goldMult *= evt.multiplier;
    }

    const mapData = MAPS[char.mapId] ?? MAPS[0];
    const avgMonster = mapData.monsters[Math.floor(mapData.monsters.length / 2)];

    offlineXp = Math.floor(avgMonster.xp * mapData.xpMult * xpMult * offlineBattles);
    offlineGold = Math.floor(avgMonster.gold * mapData.goldMult * goldMult * offlineBattles * 0.8);

    // Apply offline progress
    let newXp = char.xp + offlineXp;
    let newLevel = char.level;

    while (newLevel < 100 && newXp >= xpToNextLevel(newLevel)) {
      newXp -= xpToNextLevel(newLevel);
      newLevel++;
      offlineLevels++;
    }

    const newBonusPoints = char.bonusPoints + offlineLevels * 3;
    const newGold = char.gold + offlineGold;

    const stats = calcStats({ ...char, currentHp: char.currentHp, maxHp: char.maxHp }, equippedStats);
    const newMaxHp = stats.totalMaxHp;
    const newCurrentHp = Math.min(char.currentHp + Math.floor(newMaxHp * 0.1 * offlineBattles), newMaxHp);

    await db.update(characters).set({
      xp: newXp,
      level: newLevel,
      gold: newGold,
      bonusPoints: newBonusPoints,
      currentHp: newCurrentHp,
      maxHp: newMaxHp,
      lastOnline: now,
    }).where(eq(characters.id, char.id));

    Object.assign(char, {
      xp: newXp, level: newLevel, gold: newGold,
      bonusPoints: newBonusPoints, currentHp: newCurrentHp, maxHp: newMaxHp,
    });
  } else {
    await db.update(characters).set({ lastOnline: now }).where(eq(characters.id, char.id));
  }

  // Get guild info
  const [membership] = await db.select({ guildId: guildMembers.guildId })
    .from(guildMembers).where(eq(guildMembers.characterId, char.id)).limit(1);

  let guildName = null;
  if (membership) {
    const [guild] = await db.select({ name: guilds.name }).from(guilds)
      .where(eq(guilds.id, membership.guildId)).limit(1);
    guildName = guild?.name ?? null;
  }

  const stats = calcStats(char, equippedStats);
  const power = getPlayerPower(char.level, char.resetCount, stats.totalDamage, stats.totalDefense, stats.totalMaxHp);
  const xpRequired = xpToNextLevel(char.level);

  return jsonOk({
    character: {
      ...char,
      maxHp: stats.totalMaxHp,
      power,
      xpRequired,
      guildName,
    },
    equippedStats,
    offlineProgress: offlineBattles > 0 ? { battles: offlineBattles, xp: offlineXp, gold: offlineGold, levels: offlineLevels } : null,
  });
};

export const config: Config = { path: "/api/get-player" };
