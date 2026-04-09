import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const notifications = sqliteTable("notification", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // task_assigned, comment_on_task, status_changed, document_linked, etc.
  message: text("message").notNull(),
  linkTo: text("link_to"), // URL to navigate to when clicked (e.g. /tasks/xxx)
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
