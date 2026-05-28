import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { events } from "../../db/schema.js";
import { jsonOk, jsonError } from "./lib/auth.js";

// Seed initial events — called once on first deploy
const INITIAL_EVENTS = [
  {
    name: "XP Duplo",
    type: "xp_boost",
    multiplier: 2,
    startTime: new Date(Date.now() + 1000 * 60 * 10),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 4),
  },
  {
    name: "Ouro Duplo",
    type: "gold_boost",
    multiplier: 2,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 5),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 9),
  },
  {
    name: "Drop Aumentado",
    type: "double_drop",
    multiplier: 2,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 10),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 14),
  },
  {
    name: "Invasao de Monstros",
    type: "invasion",
    multiplier: 3,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 15),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 17),
  },
  {
    name: "Boss Mundial",
    type: "world_boss",
    multiplier: 5,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 18),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 20),
  },
];

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  // Only allow seeding from internal/admin context
  const secret = req.headers.get("X-Admin-Secret");
  if (secret !== Netlify.env.get("ADMIN_SECRET")) {
    return jsonError("Forbidden", 403);
  }

  await db.insert(events).values(INITIAL_EVENTS);

  return jsonOk({ message: "Events seeded" });
};

export const config: Config = { path: "/api/seed-events", method: "POST" };
