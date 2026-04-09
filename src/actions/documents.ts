"use server";

import { db } from "@/db";
import { documents, projects, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const insertDocumentSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().optional(),
});

export type ActionState<T = any> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

export async function createDocumentAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertDocumentSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, parsed.data.projectId)).limit(1);
    if (!project) return { error: "Projet introuvable" };

    const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Check if slug exists in the same project
    const existing = await db.select().from(documents).where(and(eq(documents.projectId, project.id), eq(documents.slug, slug)));
    const finalSlug = existing.length > 0 ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;

    // Resolve author: use session userId if it exists in DB, otherwise fallback to first admin
    let authorId = session.userId;
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
    if (!existingUser) {
      const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
      if (!fallbackAdmin) return { error: "Aucun utilisateur trouvé pour créer le document" };
      authorId = fallbackAdmin.id;
    }

    await db.insert(documents).values({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content || "",
      authorId,
    });

    revalidatePath(`/projects/${project.slug}`);
    return { data: { success: true, slug: finalSlug } };
  } catch (error) {
    console.error("[createDocumentAction]", error);
    return { error: "Erreur serveur" };
  }
}

export async function updateDocumentTitleAction(documentId: string, title: string, projectSlug: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  await db.update(documents).set({ title, slug, updatedAt: new Date() }).where(eq(documents.id, documentId));
  revalidatePath(`/projects/${projectSlug}`);
  return { data: { success: true, slug } };
}

export async function updateDocumentContentAction(documentId: string, content: string, projectSlug: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.update(documents).set({ content, updatedAt: new Date() }).where(eq(documents.id, documentId));
  revalidatePath(`/projects/${projectSlug}`);
  return { data: { success: true } };
}

export async function deleteDocumentAction(documentId: string, projectSlug: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath(`/projects/${projectSlug}`);
  return { data: { success: true } };
}
