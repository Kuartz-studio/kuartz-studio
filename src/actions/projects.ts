"use server";

import { db } from "@/db";
import { projects, projectToUser } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { insertProjectSchema } from "@/lib/validators/projects";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState<T = any> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

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
