import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text().notNull().unique(),
  class: text().notNull().default("warrior"),
  level: integer().notNull().default(1),
  xp: integer().notNull().default(0),
  gold: integer().notNull().default(100),
  resetCount: integer("reset_count").notNull().default(0),
  mapId: integer("map_id").notNull().default(0),
  bonusPoints: integer("bonus_points").notNull().default(0),
  // Base stats (points allocated by player)
  statDamage: integer("stat_damage").notNull().default(0),
  statDefense: integer("stat_defense").notNull().default(0),
  statHp: integer("stat_hp").notNull().default(0),
  statSpeed: integer("stat_speed").notNull().default(0),
  statCrit: integer("stat_crit").notNull().default(0),
  statLuck: integer("stat_luck").notNull().default(0),
  // Current HP
  currentHp: integer("current_hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  lastOnline: timestamp("last_online").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial().primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  itemData: text("item_data").notNull(),
  equipped: boolean().notNull().default(false),
  slot: text(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial().primaryKey(),
  characterName: text("character_name").notNull(),
  message: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guilds = pgTable("guilds", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  description: text().notNull().default(""),
  leaderId: integer("leader_id").notNull().references(() => characters.id),
  power: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guildMembers = pgTable("guild_members", {
  id: serial().primaryKey(),
  guildId: integer("guild_id").notNull().references(() => guilds.id),
  characterId: integer("character_id").notNull().references(() => characters.id).unique(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial().primaryKey(),
  name: text().notNull(),
  type: text().notNull(),
  multiplier: integer().notNull().default(2),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  active: boolean().notNull().default(true),
});

export const battleHistory = pgTable("battle_history", {
  id: serial().primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  monsterName: text("monster_name").notNull(),
  result: text().notNull(),
  xpGained: integer("xp_gained").notNull().default(0),
  goldGained: integer("gold_gained").notNull().default(0),
  itemDropped: text("item_dropped"),
  createdAt: timestamp("created_at").defaultNow(),
});
