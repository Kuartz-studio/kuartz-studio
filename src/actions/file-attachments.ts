"use server";

import { db } from "@/db";
import { fileAttachments, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const FORMATS = ["google_doc", "google_sheet", "figma", "notion", "drive", "github", "link", "other"] as const;

const insertAttachmentSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  url: z.string().url("L'URL n'est pas valide"),
  format: z.enum(FORMATS),
});

export type AttachmentActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { success: boolean };
};

export async function createAttachmentAction(prevState: AttachmentActionState, formData: FormData): Promise<AttachmentActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  const data = Object.fromEntries(formData);
  const parsed = insertAttachmentSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    let addedByUserId = session.userId;
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
    if (!existingUser) {
      const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
      if (!fallbackAdmin) return { error: "Aucun utilisateur trouvé" };
      addedByUserId = fallbackAdmin.id;
    }

    await db.insert(fileAttachments).values({
      taskId: parsed.data.taskId,
      projectId: parsed.data.projectId,
      addedByUserId,
      title: parsed.data.title,
      url: parsed.data.url,
      format: parsed.data.format,
    });

    revalidatePath("/tasks");
    revalidatePath("/documents");
    return { data: { success: true } };
  } catch (error) {
    console.error("[createAttachmentAction]", error);
    return { error: "Erreur serveur" };
  }
}

export async function deleteAttachmentAction(attachmentId: string): Promise<AttachmentActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.delete(fileAttachments).where(eq(fileAttachments.id, attachmentId));
  revalidatePath("/tasks");
  revalidatePath("/documents");
  return { data: { success: true } };
}

export async function getTaskAttachments(taskId: string) {
  return db
    .select()
    .from(fileAttachments)
    .where(eq(fileAttachments.taskId, taskId))
    .orderBy(desc(fileAttachments.createdAt));
}
