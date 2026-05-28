import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { characters } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, getCharacterByUserId, jsonOk, jsonError } from "./lib/auth.js";

const VALID_STATS = ["statDamage", "statDefense", "statHp", "statSpeed", "statCrit", "statLuck"] as const;
type StatKey = typeof VALID_STATS[number];

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  const char = await getCharacterByUserId(auth.userId);
  if (!char) return jsonError("Personagem nao encontrado", 404);

  let body: { stat?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const { stat, amount = 1 } = body;
  if (!stat || !VALID_STATS.includes(stat as StatKey)) return jsonError("Atributo invalido");
  if (!Number.isInteger(amount) || amount < 1 || amount > 100) return jsonError("Quantidade invalida (1-100)");
  if (char.bonusPoints < amount) return jsonError(`Pontos insuficientes. Voce tem ${char.bonusPoints}`);

  await db.update(characters).set({
    [stat]: (char[stat as StatKey] as number) + amount,
    bonusPoints: char.bonusPoints - amount,
  }).where(eq(characters.id, char.id));

  return jsonOk({ message: `+${amount} em ${stat}`, bonusPoints: char.bonusPoints - amount });
};

export const config: Config = { path: "/api/allocate-stats", method: "POST" };
