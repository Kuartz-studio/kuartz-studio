import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";
import { users } from "./users";

const createId = () => crypto.randomUUID();

export const tasks = sqliteTable("task", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  issueNumber: integer("issue_number"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("BACKLOG"), // BACKLOG, TODO, IN_PROGRESS, PAUSED, DONE, CANCELED
  priority: integer("priority").notNull().default(0), // 0, 1, 2, 3, 4
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // added creator
  orderInProject: integer("order_in_project").default(0),
  targetDate: integer("target_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
