// Small, idempotent schema updates applied when the server starts, so new
// columns exist before the app queries them. Every statement must be safe to
// run again (IF NOT EXISTS). Failures are logged and do not block the start.
import { PrismaClient } from "@prisma/client";

const STATEMENTS = [
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "winner_place" INTEGER`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "tweet_url" TEXT`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "image_url" TEXT`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "category" TEXT`,
];

if (!process.env.DATABASE_URL) {
  console.log("[db-migrate] DATABASE_URL not set, skipping");
  process.exit(0);
}

const prisma = new PrismaClient();
try {
  for (const sql of STATEMENTS) await prisma.$executeRawUnsafe(sql);
  console.log(`[db-migrate] ok (${STATEMENTS.length} statements)`);
} catch (e) {
  console.error("[db-migrate] failed:", e instanceof Error ? e.message : e);
} finally {
  await prisma.$disconnect();
}
