import "dotenv/config";
import { db } from "./index";
import { sql } from "drizzle-orm";

async function setupTriggers() {
  console.log("Setting up SQLite triggers...");
  
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS task_issue_number_trigger
    AFTER INSERT ON task
    FOR EACH ROW
    WHEN NEW.issue_number IS NULL
    BEGIN
      UPDATE task SET issue_number = (
        SELECT COALESCE(MAX(issue_number), 0) + 1 FROM task WHERE project_id = NEW.project_id
      ) WHERE id = NEW.id;
    END;
  `);

  console.log("Triggers setup complete.");
}

setupTriggers().catch(console.error);
