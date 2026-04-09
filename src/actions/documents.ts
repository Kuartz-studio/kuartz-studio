"use server";

import { db } from "@/db";
import { documents, documentToTask, projects, users } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const insertDocumentSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().optional(),
  projectId: z.string().optional(), // Nullable — doc can exist without project
  taskId: z.string().optional(),     // If provided, auto-link via M2M
});

export type ActionState<T = any> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

async function resolveAuthorId(sessionUserId: string): Promise<string | null> {
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, sessionUserId)).limit(1);
  if (existingUser) return existingUser.id;
  const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  return fallbackAdmin?.id || null;
}

export async function createDocumentAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  const data = Object.fromEntries(formData);
  const parsed = insertDocumentSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const authorId = await resolveAuthorId(session.userId);
    if (!authorId) return { error: "Aucun utilisateur trouvé" };

    const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const projectId = parsed.data.projectId || null;

    // Check slug collision
    const conditions = projectId
      ? and(eq(documents.projectId, projectId), eq(documents.slug, slug))
      : and(isNull(documents.projectId), eq(documents.slug, slug));
    const existing = await db.select().from(documents).where(conditions);
    const finalSlug = existing.length > 0 ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;

    const [newDoc] = await db.insert(documents).values({
      projectId,
      authorId,
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content || "",
    }).returning({ id: documents.id });

    // Auto-link to task if taskId provided
    if (parsed.data.taskId && newDoc) {
      await db.insert(documentToTask).values({
        documentId: newDoc.id,
        taskId: parsed.data.taskId,
      });
    }

    revalidatePath("/documents");
    if (projectId) {
      const [proj] = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, projectId)).limit(1);
      if (proj) revalidatePath(`/projects/${proj.slug}`);
    }
    return { data: { success: true, slug: finalSlug } };
  } catch (error) {
    console.error("[createDocumentAction]", error);
    return { error: "Erreur serveur" };
  }
}

export async function updateDocumentTitleAction(documentId: string, title: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  await db.update(documents).set({ title, slug, updatedAt: new Date() }).where(eq(documents.id, documentId));
  revalidatePath("/documents");
  return { data: { success: true, slug } };
}

export async function updateDocumentContentAction(documentId: string, content: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  await db.update(documents).set({ content, updatedAt: new Date() }).where(eq(documents.id, documentId));
  revalidatePath("/documents");
  return { data: { success: true } };
}

export async function deleteDocumentAction(documentId: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath("/documents");
  return { data: { success: true } };
}

export async function linkDocumentToTaskAction(documentId: string, taskId: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  try {
    await db.insert(documentToTask).values({ documentId, taskId });
    revalidatePath("/tasks");
    return { data: { success: true } };
  } catch {
    return { error: "Lien déjà existant" };
  }
}

export async function unlinkDocumentFromTaskAction(documentId: string, taskId: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  await db.delete(documentToTask).where(and(eq(documentToTask.documentId, documentId), eq(documentToTask.taskId, taskId)));
  revalidatePath("/tasks");
  return { data: { success: true } };
}

export async function linkDocumentToProjectAction(documentId: string, projectId: string): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  await db.update(documents).set({ projectId }).where(eq(documents.id, documentId));
  revalidatePath("/documents");
  revalidatePath("/projects");
  return { data: { success: true } };
}
