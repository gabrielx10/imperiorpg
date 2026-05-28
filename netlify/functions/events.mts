import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { events } from "../../db/schema.js";
import { and, eq, gt, lt } from "drizzle-orm";
import { validateAuth, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const now = new Date();
  const activeEvents = await db.select().from(events)
    .where(and(eq(events.active, true), lt(events.startTime, now), gt(events.endTime, now)));

  const upcomingEvents = await db.select().from(events)
    .where(and(eq(events.active, true), gt(events.startTime, now)));

  return jsonOk({ activeEvents, upcomingEvents });
};

export const config: Config = { path: "/api/events" };
