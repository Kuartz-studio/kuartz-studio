"use server";

import { db } from "@/db";
import { projects, tasks, comments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function verifyPortalAccess(slug: string, token: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.clientPortalToken, token)))
    .limit(1);
    
  return project;
}

export async function toggleClientTaskStatusAction(slug: string, token: string, taskId: string, newStatus: "DONE" | "IN_PROGRESS" | "TODO") {
  const project = await verifyPortalAccess(slug, token);
  if (!project) return { error: "Accès au projet refusé ou token invalide" };

  await db.update(tasks)
    .set({ status: newStatus })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, project.id)));
    
  revalidatePath(`/client/${slug}-${token}`);
  return { success: true };
}

export async function addClientCommentAction(slug: string, token: string, taskId: string, authorId: string, content: string) {
  const project = await verifyPortalAccess(slug, token);
  if (!project) return { error: "Accès au projet refusé ou token invalide" };

  // Vérifier que la tâche appartient bien au projet
  const [task] = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.projectId, project.id))).limit(1);
  if (!task) return { error: "Tâche introuvable ou étrangère au projet" };

  await db.insert(comments).values({
    taskId,
    authorId,
    content,
  });

  revalidatePath(`/client/${slug}-${token}`);
  return { success: true };
}
