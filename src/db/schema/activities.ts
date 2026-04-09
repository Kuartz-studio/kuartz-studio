import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const activities = sqliteTable("activity", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  type: text("type").notNull(), // task_created, task_updated, task_deleted, comment_created, document_created, project_created, attachment_added, etc.
  entityType: text("entity_type").notNull(), // task, project, document, comment, attachment
  entityId: text("entity_id").notNull(),
  entityTitle: text("entity_title"), // Human-readable title for display
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  metadata: text("metadata"), // JSON string for extra context (field changed, old/new values, etc.)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
