import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { validateAuth, jsonOk, jsonError } from "./lib/auth.js";

export default async (req: Request) => {
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const auth = await validateAuth(req);
  if (!auth) return jsonError("Nao autorizado", 401);

  await db.update(users).set({ sessionToken: null }).where(eq(users.id, auth.userId));

  return jsonOk({ message: "Logout realizado com sucesso" });
};

export const config: Config = { path: "/api/logout", method: "POST" };
