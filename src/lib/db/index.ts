import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type ChaosDb = ReturnType<typeof drizzle>;

let cached: ChaosDb | null = null;

export function isPersistenceEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function createDb(): ChaosDb | null {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return null;
  }

  if (!cached) {
    cached = drizzle(postgres(url, { max: 4, prepare: false }));
  }

  return cached;
}
