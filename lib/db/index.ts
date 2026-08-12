import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  db?: Db;
};

export function getDb(): Db {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and start Postgres.",
    );
  }

  const client =
    globalForDb.pgClient ??
    postgres(databaseUrl, {
      max: 10,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    // Reuse the connection, but rebuild drizzle with the current schema so
    // HMR doesn't leave a stale relational query map (missing new columns).
    globalForDb.pgClient = client;
    return drizzle(client, { schema });
  }

  if (!globalForDb.db) {
    globalForDb.db = drizzle(client, { schema });
  }
  return globalForDb.db;
}

/** Convenience alias for server modules. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
