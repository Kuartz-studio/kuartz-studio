"use server";

import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const insertTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export type ActionState<T = any> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

export async function createTaskAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertTaskSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, parsed.data.projectId)).limit(1);
    if (!project) return { error: "Projet introuvable" };

    await db.insert(tasks).values({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status || "todo",
      priority: parsed.data.priority || "medium",
    });

    revalidatePath(`/projects/${project.slug}`);
    return { data: { success: true } };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}

export async function updateTaskAssigneesAction(taskId: string, assignees: string[], projectSlug: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.update(tasks).set({ assignees }).where(eq(tasks.id, taskId));
  revalidatePath(`/projects/${projectSlug}`);
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: "todo"|"in_progress"|"review"|"done", projectSlug: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }
  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  revalidatePath(`/projects/${projectSlug}`);
}
