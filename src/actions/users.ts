"use server";

import { db } from "@/db";
import { users, projectToUser } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateUserAction(userId: string, data: { name?: string; email?: string; role?: "admin" | "employee" | "customer" }) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;

  await db.update(users).set(data).where(eq(users.id, userId));
  revalidatePath("/users");
}

export async function updateUserProjectsAction(userId: string, projectIds: string[]) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;

  await db.delete(projectToUser).where(eq(projectToUser.userId, userId));
  if (projectIds.length > 0) {
    await db.insert(projectToUser).values(projectIds.map(projectId => ({ projectId, userId, role: "member" as const })));
  }
  revalidatePath("/users");
  revalidatePath("/projects");
}

export async function deleteUserAction(userId: string) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/users");
}
