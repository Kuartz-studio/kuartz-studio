"use server";

import { db } from "@/db";
import { tasks, projects, taskAssignees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "./activities";
import { notifyAdmins } from "./notifications";

const insertTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "PAUSED", "DONE", "CANCELED"]).optional(),
  priority: z.coerce.number().int().min(0).max(4).optional(),
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
      status: parsed.data.status || "BACKLOG",
      priority: parsed.data.priority ?? 0,
      createdByUserId: session.userId,
    });

    revalidatePath(`/projects/${project.slug}`);
    await logActivity({ type: "task_created", entityType: "task", entityId: parsed.data.projectId, entityTitle: parsed.data.title });
    await notifyAdmins({ type: "task_created", message: `Nouvelle tâche : ${parsed.data.title}`, linkTo: `/projects/${project.slug}`, excludeUserId: session.userId });
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

  await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
  if (assignees.length > 0) {
    await db.insert(taskAssignees).values(assignees.map(userId => ({ taskId, userId })));
  }
  revalidatePath(`/projects/${projectSlug}`);
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: "BACKLOG"|"TODO"|"IN_PROGRESS"|"PAUSED"|"DONE"|"CANCELED", projectSlug: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }
  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  await logActivity({ type: "task_status_changed", entityType: "task", entityId: taskId, metadata: { status } });
  revalidatePath(`/projects/${projectSlug}`);
}
