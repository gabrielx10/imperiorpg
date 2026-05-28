import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

export const config: Config = { path: "/api/health", method: "GET" };
