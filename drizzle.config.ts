import { defineConfig } from "drizzle-kit";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for drizzle-kit running in Node.js (not edge runtime)
neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
