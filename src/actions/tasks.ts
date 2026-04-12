"use server";

import { db } from "@/db";
import { tasks, projects, taskAssignees } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "./activities";
import { notifyAdmins } from "./notifications";
import type { ActionState } from "@/types/actions";

const insertTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "PAUSED", "DONE", "CANCELED"]).optional(),
  priority: z.coerce.number().int().min(0).max(4).optional(),
  targetDate: z.string().optional(),
});



export async function createTaskAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertTaskSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  
  const assignees = formData.getAll("assignees") as string[];

  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, parsed.data.projectId)).limit(1);
    if (!project) return { error: "Projet introuvable" };

    // Resolve createdByUserId — session user may not exist in DB
    let createdByUserId = session.userId;
    const { users } = await import("@/db/schema");
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
    if (!existingUser) {
      const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
      if (!fallbackAdmin) return { error: "Aucun utilisateur trouvé" };
      createdByUserId = fallbackAdmin.id;
    }

    const [latestTask] = await db.select({ num: tasks.issueNumber }).from(tasks).orderBy(desc(tasks.issueNumber)).limit(1);
    const nextIssueNumber = (latestTask?.num ?? 0) + 1;

    const [newTask] = await db.insert(tasks).values({
      projectId: parsed.data.projectId,
      issueNumber: nextIssueNumber,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status || "BACKLOG",
      priority: parsed.data.priority ?? 0,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      createdByUserId,
    }).returning();

    if (newTask && assignees.length > 0) {
      await db.insert(taskAssignees).values(
        assignees.map((userId) => ({ taskId: newTask.id, userId }))
      );
    }

    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/tasks");
    await logActivity({ type: "task_created", entityType: "task", entityId: newTask?.id ?? parsed.data.projectId, entityTitle: parsed.data.title });
    await notifyAdmins({ type: "task_created", message: `Nouvelle tâche : ${parsed.data.title}`, linkTo: `/projects/${project.slug}`, excludeUserId: session.userId });
    return { data: { success: true } };
  } catch (error) {
    console.error("[createTaskAction]", error);
    return { error: "Erreur serveur" };
  }
}

export async function updateTaskAssigneesAction(taskId: string, assignees: string[]) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
  if (assignees.length > 0) {
    await db.insert(taskAssignees).values(assignees.map(userId => ({ taskId, userId })));
  }
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, status: "BACKLOG"|"TODO"|"IN_PROGRESS"|"PAUSED"|"DONE"|"CANCELED") {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }
  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  await logActivity({ type: "task_status_changed", entityType: "task", entityId: taskId, metadata: { status } });
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
}

export async function updateTaskAction(taskId: string, payload: { title?: string; priority?: number; targetDate?: Date | null }) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }
  await db.update(tasks).set(payload).where(eq(tasks.id, taskId));
  
  // if title changed, log it? Optional. We log status explicitly.
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) return { error: "Tâche introuvable" };

  await db.delete(tasks).where(eq(tasks.id, taskId));
  await logActivity({ type: "task_deleted", entityType: "task", entityId: taskId, entityTitle: task.title });
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
  return { success: true };
}

export async function duplicateTaskAction(taskId: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const [original] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!original) return { error: "Tâche introuvable" };

  const [latestTask] = await db.select({ num: tasks.issueNumber }).from(tasks).orderBy(desc(tasks.issueNumber)).limit(1);
  const nextIssueNumber = (latestTask?.num ?? 0) + 1;

  const [newTask] = await db.insert(tasks).values({
    projectId: original.projectId,
    issueNumber: nextIssueNumber,
    title: `${original.title} (copie)`,
    description: original.description,
    status: "BACKLOG",
    priority: original.priority,
    targetDate: original.targetDate,
    createdByUserId: session.userId,
  }).returning();

  // Copy assignees
  if (newTask) {
    const originalAssignees = await db.select().from(taskAssignees).where(eq(taskAssignees.taskId, taskId));
    if (originalAssignees.length > 0) {
      await db.insert(taskAssignees).values(
        originalAssignees.map(a => ({ taskId: newTask.id, userId: a.userId }))
      );
    }
  }

  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
  return { success: true };
}

