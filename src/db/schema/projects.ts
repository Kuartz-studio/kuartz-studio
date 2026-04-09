import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { init } from "@paralleldrive/cuid2";
import { users } from "./users";

const createId = init({ length: 24 });

export const projects = sqliteTable("project", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const projectToUser = sqliteTable("project_to_user", {
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "member", "viewer"] }).notNull().default("viewer"),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.userId] })
]);
