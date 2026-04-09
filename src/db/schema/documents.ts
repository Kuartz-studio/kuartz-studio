import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";
import { tasks } from "./tasks";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const documents = sqliteTable("document", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }), // Nullable — doc peut exister sans projet
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content"),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const documentToTask = sqliteTable("document_to_task", {
  documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.documentId, table.taskId] }),
]);
