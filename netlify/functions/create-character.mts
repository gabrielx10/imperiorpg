import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";
import { CLASSES } from "./lib/gameData.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const existing = await getCharacterByUserId(auth.userId);
  if (existing) return jsonError("Voce ja tem um personagem", 409);

  let body: { name?: string; class?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { name, class: charClass } = body;
  if (!name || name.length < 3 || name.length > 20) return jsonError("Nome deve ter 3-20 caracteres");
  if (!/^[a-zA-Z0-9_ ]+$/.test(name)) return jsonError("Nome invalido");

  const validClasses = Object.keys(CLASSES);
  const cls = charClass && validClasses.includes(charClass) ? charClass : "warrior";

  try {
    const [char] = await db.insert(characters).values({
      userId: auth.userId,
      name: name.trim(),
      class: cls,
      level: 1,
      xp: 0,
      gold: 500,
      currentHp: 100,
      maxHp: 100,
    }).returning();

    return jsonOk({ character: char }, 201);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "23505") return jsonError("Nome de personagem ja em uso", 409);
    throw e;
  }
};

export const config: Config = { path: "/api/create-character", method: "POST" };
