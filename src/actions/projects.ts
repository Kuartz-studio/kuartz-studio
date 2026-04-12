"use server";

import { db } from "@/db";
import { projects, projectToUser, users, tasks, documents, fileAttachments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { insertProjectSchema } from "@/lib/validators/projects";
import { base64ImageSchema } from "@/lib/validators/image";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/actions";



export async function createProjectAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé à créer un projet" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertProjectSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, slug, description } = parsed.data;

  try {
    const existing = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (existing.length > 0) return { error: "Ce slug (URL) est déjà utilisé par un autre projet." };

    const [project] = await db.insert(projects).values({ name, slug, description }).returning();
    if (!project) return { error: "Erreur serveur lors de la création du projet" };
    
    // Le créateur est owner de ce projet
    await db.insert(projectToUser).values({ projectId: project.id, userId: session.userId, role: "owner" });

    revalidatePath("/projects");
  } catch (error) {
    return { error: "Erreur serveur lors de la création du projet" };
  }
  
  redirect(`/projects`);
}

export async function deleteProjectAction(projectId: string) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;
  
  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectAction(projectId: string, data: { name?: string; url?: string | null; priority?: number }) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  await db.update(projects).set(data).where(eq(projects.id, projectId));
  revalidatePath("/projects");
}

export async function updateProjectUsersAction(projectId: string, userIds: string[]) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  await db.delete(projectToUser).where(eq(projectToUser.projectId, projectId));
  if (userIds.length > 0) {
    await db.insert(projectToUser).values(userIds.map(userId => ({ projectId, userId, role: "member" as const })));
  }
  revalidatePath("/projects");
}

export async function getProjectsWithUsers() {
  const allProjects = await db.select().from(projects);
  const allLinks = await db
    .select({ projectId: projectToUser.projectId, userId: projectToUser.userId, role: projectToUser.role, userName: users.name, userAvatar: users.avatarBase64 })
    .from(projectToUser)
    .leftJoin(users, eq(projectToUser.userId, users.id));

  // Fetch content counts for each project
  const allTasks = await db.select({ id: tasks.id, projectId: tasks.projectId, status: tasks.status }).from(tasks);
  const allDocs = await db.select({ id: documents.id, projectId: documents.projectId, category: documents.category }).from(documents);
  const allFiles = await db.select({ id: fileAttachments.id, projectId: fileAttachments.projectId }).from(fileAttachments);

  return allProjects.map(p => {
    const projectTasks = allTasks.filter(t => t.projectId === p.id);
    return {
      ...p,
      users: allLinks.filter(l => l.projectId === p.id).map(l => ({
        id: l.userId,
        name: l.userName,
        avatarBase64: l.userAvatar,
        role: l.role,
      })),
      contentCounts: {
        tasks: projectTasks.length,
        tasksDone: projectTasks.filter(t => t.status === "DONE").length,
        documents: allDocs.filter(d => d.projectId === p.id).length,
        files: allFiles.filter(f => f.projectId === p.id).length,
        documentCategories: allDocs.filter(d => d.projectId === p.id).reduce((acc, doc) => {
          const cat = doc.category || "Autre";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  });
}

export async function updateProjectLogoAction(projectId: string, base64: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  const parsed = base64ImageSchema.safeParse(base64);
  if (!parsed.success) return;

  await db.update(projects).set({ logoBase64: parsed.data }).where(eq(projects.id, projectId));
  revalidatePath("/projects");
  revalidatePath("/tasks");
}

export async function updatePortalSettingsAction(projectId: string, settings: any) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  await db.update(projects).set({ portalSettings: settings }).where(eq(projects.id, projectId));
  revalidatePath("/projects", "layout");
}

export async function updatePortalSvgAction(projectId: string, svg: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  // Simple sanitize check (must start with <svg)
  if (svg && !svg.trim().toLowerCase().startsWith("<svg")) {
     return { error: "Code SVG invalide" };
  }

  await db.update(projects).set({ iconSvg: svg || null }).where(eq(projects.id, projectId));
  revalidatePath(`/projects`);
  return { success: true };
}

export async function regeneratePortalTokenAction(projectId: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  await db.update(projects).set({ clientPortalToken: newToken }).where(eq(projects.id, projectId));
  revalidatePath(`/projects`);
}
