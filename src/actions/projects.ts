"use server";

import { db } from "@/db";
import { projects, projectToUser, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { insertProjectSchema } from "@/lib/validators/projects";
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
  
  redirect(`/projects/${slug}`);
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
    .select({ projectId: projectToUser.projectId, userId: projectToUser.userId, role: projectToUser.role, userName: users.name, userAvatar: users.avatarUrl })
    .from(projectToUser)
    .leftJoin(users, eq(projectToUser.userId, users.id));

  return allProjects.map(p => ({
    ...p,
    users: allLinks.filter(l => l.projectId === p.id).map(l => ({
      id: l.userId,
      name: l.userName,
      avatarUrl: l.userAvatar,
      role: l.role,
    })),
  }));
}

