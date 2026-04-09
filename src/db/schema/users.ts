import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { init } from "@paralleldrive/cuid2";

const createId = init({ length: 24 });

export const users = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"), // Nullable because customers do not use passwords
  role: text("role", { enum: ["admin", "employee", "customer"] }).notNull().default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
