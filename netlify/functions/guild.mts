import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { guilds, guildMembers, characters } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { getPlayerPower } from "./lib/gameData.js";
import { calcStats } from "./lib/battle.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  if (req.method === "GET") {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "list";

    if (action === "my") {
      const [membership] = await db.select().from(guildMembers)
        .where(eq(guildMembers.characterId, char.id)).limit(1);

      if (!membership) return jsonOk({ guild: null });

      const [guild] = await db.select().from(guilds).where(eq(guilds.id, membership.guildId)).limit(1);
      if (!guild) return jsonOk({ guild: null });

      const members = await db.select({ characterId: guildMembers.characterId }).from(guildMembers)
        .where(eq(guildMembers.guildId, guild.id));

      const memberDetails = [];
      for (const m of members) {
        const [c] = await db.select().from(characters).where(eq(characters.id, m.characterId)).limit(1);
        if (c) {
          const stats = calcStats(c, { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 });
          const power = getPlayerPower(c.level, c.resetCount, stats.totalDamage, stats.totalDefense, stats.totalMaxHp);
          memberDetails.push({ name: c.name, class: c.class, level: c.level, power, isLeader: c.id === guild.leaderId });
        }
      }

      return jsonOk({ guild: { ...guild, members: memberDetails } });
    }

    // List guilds with power ranking
    const allGuilds = await db.select().from(guilds).orderBy(desc(guilds.power)).limit(20);
    const guildList = [];
    for (const g of allGuilds) {
      const memberCount = await db.select({ id: guildMembers.id }).from(guildMembers).where(eq(guildMembers.guildId, g.id));
      guildList.push({ ...g, memberCount: memberCount.length });
    }

    return jsonOk({ guilds: guildList });
  }

  if (req.method === "POST") {
    let body: { action?: string; guildId?: number; name?: string; description?: string };
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const { action } = body;

    if (action === "create") {
      // Check if already in a guild
      const [existing] = await db.select().from(guildMembers).where(eq(guildMembers.characterId, char.id)).limit(1);
      if (existing) return jsonError("Voce ja faz parte de uma guilda");

      if (!body.name || body.name.length < 3 || body.name.length > 30) return jsonError("Nome de guilda invalido (3-30 chars)");

      if (char.gold < 1000) return jsonError("Criar uma guilda custa 1000 de ouro");

      try {
        const [guild] = await db.insert(guilds).values({
          name: body.name.trim(),
          description: (body.description ?? "").trim().slice(0, 100),
          leaderId: char.id,
          power: 0,
        }).returning();

        await db.insert(guildMembers).values({ guildId: guild.id, characterId: char.id });
        await db.update(characters).set({ gold: char.gold - 1000 }).where(eq(characters.id, char.id));

        return jsonOk({ message: "Guilda criada!", guild }, 201);
      } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === "23505") return jsonError("Nome de guilda ja em uso", 409);
        throw e;
      }
    }

    if (action === "join") {
      const [existing] = await db.select().from(guildMembers).where(eq(guildMembers.characterId, char.id)).limit(1);
      if (existing) return jsonError("Voce ja faz parte de uma guilda");

      if (!body.guildId) return jsonError("guildId obrigatorio");

      const [guild] = await db.select().from(guilds).where(eq(guilds.id, body.guildId)).limit(1);
      if (!guild) return jsonError("Guilda nao encontrada", 404);

      await db.insert(guildMembers).values({ guildId: guild.id, characterId: char.id });

      // Update guild power
      const stats = calcStats(char, { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 });
      const power = getPlayerPower(char.level, char.resetCount, stats.totalDamage, stats.totalDefense, stats.totalMaxHp);
      await db.update(guilds).set({ power: guild.power + power }).where(eq(guilds.id, guild.id));

      return jsonOk({ message: `Voce entrou na guilda ${guild.name}!` });
    }

    if (action === "leave") {
      const [membership] = await db.select().from(guildMembers).where(eq(guildMembers.characterId, char.id)).limit(1);
      if (!membership) return jsonError("Voce nao faz parte de nenhuma guilda");

      const [guild] = await db.select().from(guilds).where(eq(guilds.id, membership.guildId)).limit(1);

      await db.delete(guildMembers).where(eq(guildMembers.characterId, char.id));

      if (guild) {
        const stats = calcStats(char, { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 });
        const power = getPlayerPower(char.level, char.resetCount, stats.totalDamage, stats.totalDefense, stats.totalMaxHp);
        await db.update(guilds).set({ power: Math.max(0, guild.power - power) }).where(eq(guilds.id, guild.id));

        // If leader leaving, disband or transfer
        if (guild.leaderId === char.id) {
          const [newLeader] = await db.select().from(guildMembers).where(eq(guildMembers.guildId, guild.id)).limit(1);
          if (!newLeader) {
            await db.delete(guilds).where(eq(guilds.id, guild.id));
          } else {
            await db.update(guilds).set({ leaderId: newLeader.characterId }).where(eq(guilds.id, guild.id));
          }
        }
      }

      return jsonOk({ message: "Voce saiu da guilda" });
    }

    return jsonError("Acao invalida");
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = { path: "/api/guild" };
