"use server";

import { db } from "@/db";
import { users, projectToUser } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { base64ImageSchema } from "@/lib/validators/image";

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

export async function updateUserAvatarAction(userId: string, base64: string) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;

  const parsed = base64ImageSchema.safeParse(base64);
  if (!parsed.success) return;

  await db.update(users).set({ avatarBase64: parsed.data }).where(eq(users.id, userId));
  revalidatePath("/users");
  revalidatePath("/tasks");
  revalidatePath("/projects");
}

export async function createUserAction(data: { name: string; email: string; role: "admin" | "employee" | "customer" }) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return { error: "Non autorisé" };

  const trimmedName = data.name.trim();
  const trimmedEmail = data.email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail) return { error: "Nom et email requis" };

  // Check for existing email
  const existing = await db.select().from(users).where(eq(users.email, trimmedEmail)).limit(1);
  if (existing.length > 0) return { error: "Cet email est déjà utilisé" };

  await db.insert(users).values({
    name: trimmedName,
    email: trimmedEmail,
    role: data.role,
  });

  revalidatePath("/users");
  return { success: true };
}
