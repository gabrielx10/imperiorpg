import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters, guildMembers } from "../../db/schema.js";
import { eq, desc, ne } from "drizzle-orm";
import { validateAuth, jsonOk, jsonError } from "./lib/auth.js";
import { getPlayerPower, xpToNextLevel } from "./lib/gameData.js";
import { calcStats } from "./lib/battle.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "level";

  const allChars = await db.select().from(characters).limit(100);

  const ranked = allChars.map(c => {
    const stats = calcStats(c, { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 });
    const power = getPlayerPower(c.level, c.resetCount, stats.totalDamage, stats.totalDefense, stats.totalMaxHp);
    return { name: c.name, class: c.class, level: c.level, resetCount: c.resetCount, gold: c.gold, power };
  });

  let sorted = ranked;
  if (type === "level") {
    sorted = ranked.sort((a, b) => b.level - a.level || b.resetCount - a.resetCount);
  } else if (type === "power") {
    sorted = ranked.sort((a, b) => b.power - a.power);
  } else if (type === "resets") {
    sorted = ranked.sort((a, b) => b.resetCount - a.resetCount || b.level - a.level);
  } else if (type === "gold") {
    sorted = ranked.sort((a, b) => b.gold - a.gold);
  }

  return jsonOk({ ranking: sorted.slice(0, 50), type });
};

export const config: Config = { path: "/api/ranking" };
