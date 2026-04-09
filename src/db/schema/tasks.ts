import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { init } from "@paralleldrive/cuid2";
import { projects } from "./projects";

const createId = init({ length: 24 });

export const tasks = sqliteTable("task", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  issueNumber: integer("issue_number"), // Auto-incremented per project via SQLite Trigger
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "review", "done"] }).notNull().default("todo"),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
  assignees: text("assignees", { mode: "json" }).$type<string[]>().default([]),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  dueDate: integer("due_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
