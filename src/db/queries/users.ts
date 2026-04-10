import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/** List query — excludes avatarBase64 for performance */
export async function getUsersList() {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);
}

/** Detail query — includes avatarBase64 */
export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
