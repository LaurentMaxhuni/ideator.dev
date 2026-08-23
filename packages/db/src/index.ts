import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export * from "./schema";

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export function requireDb() {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is required for project persistence.");
  }

  return db;
}
