import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tasks } from "./tasks";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const comments = sqliteTable("comment", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
