import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminLoginWrapper } from "@/components/auth/AdminLoginWrapper";

export default async function LoginPage() {
  const adminUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email
  }).from(users).where(eq(users.role, "admin"));

  return <AdminLoginWrapper admins={adminUsers} />;
}
