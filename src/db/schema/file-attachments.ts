import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tasks } from "./tasks";
import { projects } from "./projects";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const fileAttachments = sqliteTable("file", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  addedByUserId: text("added_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  format: text("format").notNull().default("other"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
