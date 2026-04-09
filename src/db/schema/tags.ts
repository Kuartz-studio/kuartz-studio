import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";
import { tasks } from "./tasks";
import { users } from "./users";
import { init } from "@paralleldrive/cuid2";

const createId = () => crypto.randomUUID();

export const tags = sqliteTable("tag", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
});

export const taskTags = sqliteTable("task_tag", {
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.taskId, t.tagId] })
}));

export const taskAssignees = sqliteTable("task_assignee", {
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.taskId, t.userId] })
}));
