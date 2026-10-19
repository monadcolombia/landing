// Small, idempotent schema updates applied when the server starts, so new
// columns exist before the app queries them. Every statement must be safe to
// run again (IF NOT EXISTS). Failures are logged and do not block the start.
import { PrismaClient } from "@prisma/client";

const STATEMENTS = [
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "winner_place" INTEGER`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "tweet_url" TEXT`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "image_url" TEXT`,
  `ALTER TABLE "judging_projects" ADD COLUMN IF NOT EXISTS "category" TEXT`,
  `CREATE TABLE IF NOT EXISTS "site_posts" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edition" "Edition" NOT NULL DEFAULT 'v2',
    "url" TEXT NOT NULL,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS "site_posts_edition_idx" ON "site_posts"("edition")`,
  `CREATE TABLE IF NOT EXISTS "gallery_photos" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edition" "Edition" NOT NULL DEFAULT 'v2',
    "alt" TEXT,
    "mime" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS "gallery_photos_edition_idx" ON "gallery_photos"("edition")`,
  `CREATE TABLE IF NOT EXISTS "survey_responses" (
    "id" TEXT PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edition" "Edition" NOT NULL DEFAULT 'v2',
    "overall" INTEGER NOT NULL,
    "attendance" TEXT NOT NULL,
    "heard_from" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "built_before" BOOLEAN NOT NULL,
    "bootcamp" TEXT NOT NULL,
    "mentors" INTEGER,
    "venue" INTEGER,
    "platform" INTEGER,
    "organization" INTEGER,
    "improve" TEXT,
    "keep_building" TEXT NOT NULL,
    "notify_next" BOOLEAN NOT NULL DEFAULT false,
    "contact" TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS "survey_responses_edition_idx" ON "survey_responses"("edition")`,
  `ALTER TABLE "survey_responses" ADD COLUMN IF NOT EXISTS "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
  // First run only: the V1 posts that used to be hardcoded in Highlights.
  `INSERT INTO "site_posts" ("id", "edition", "url", "label", "sort_order")
   SELECT gen_random_uuid()::text, 'v1', v.url, v.label, v.ord FROM (VALUES
     ('https://x.com/i/status/2064370221058568234', 'Recap Monad Blitz Medellín', 1),
     ('https://x.com/i/status/2064481863033311374', 'Ganadores Medellín', 2),
     ('https://x.com/i/status/2064104613020582172', 'Equipos Medellín', 3),
     ('https://x.com/i/status/2064056162417303775', 'Mentores y staff Medellín', 4)
   ) AS v(url, label, ord)
   WHERE NOT EXISTS (SELECT 1 FROM "site_posts")`,
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
