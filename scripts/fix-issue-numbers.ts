import "dotenv/config";
import { db } from "../src/db";
import { tasks } from "../src/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";

async function run() {
  console.log("Starting migration for issue numbers...");
  console.log("DB URL:", process.env.TURSO_DATABASE_URL);

  // Proper way to get max issue number:
  const [maxRecord] = await db
    .select({ max: tasks.issueNumber })
    .from(tasks)
    .orderBy(desc(tasks.issueNumber))
    .limit(1);

  let nextIssueNumber = (maxRecord?.max ?? 0) + 1;
  console.log("Starting from issueNumber:", nextIssueNumber);

  // Get all tasks ordered by creation date
  const allTasks = await db
    .select()
    .from(tasks)
    .orderBy(asc(tasks.createdAt));

  let updatedCount = 0;
  for (const task of allTasks) {
    if (task.issueNumber == null) {
      console.log(`Processing task ${task.id} -> issueNumber: ${nextIssueNumber}`);
      await db.update(tasks)
        .set({ issueNumber: nextIssueNumber })
        .where(eq(tasks.id, task.id));
      nextIssueNumber++;
      updatedCount++;
    }
  }

  console.log(`Migration complete! Updated ${updatedCount} tasks.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
