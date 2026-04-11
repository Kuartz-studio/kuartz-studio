import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Creating tmp table...");
    await db.run(sql`
      CREATE TABLE file_attachment_tmp (
        id text PRIMARY KEY,
        project_id text REFERENCES project(id) ON DELETE CASCADE,
        task_id text REFERENCES task(id) ON DELETE CASCADE,
        added_by_user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        title text NOT NULL,
        url text NOT NULL,
        format text NOT NULL DEFAULT 'other',
        created_at integer
      );
    `);
    console.log("Inserting data...");
    await db.run(sql`
      INSERT INTO file_attachment_tmp (id, task_id, added_by_user_id, title, url, format, created_at)
      SELECT id, task_id, added_by_user_id, title, url, format, created_at FROM file_attachment;
    `);
    console.log("Dropping old table...");
    await db.run(sql`DROP TABLE file_attachment;`);
    console.log("Renaming tmp table...");
    await db.run(sql`ALTER TABLE file_attachment_tmp RENAME TO file_attachment;`);
    console.log("Done!");
  } catch(e) {
    console.error(e);
  }
}
run();
