import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return null;
  }

  return drizzle(postgres(url));
}
