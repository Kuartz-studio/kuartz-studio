"use server";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "./activities";
import { notifyAdmins } from "./notifications";

const insertCommentSchema = z.object({
  taskId: z.string(),
  content: z.string().min(1, "Le commentaire ne peut pas être vide"),
});

export type CommentActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: any;
};

export async function createCommentAction(prevState: CommentActionState, formData: FormData): Promise<CommentActionState> {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  const data = Object.fromEntries(formData);
  const parsed = insertCommentSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    // Resolve author
    let authorId = session.userId;
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
    if (!existingUser) {
      const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
      if (!fallbackAdmin) return { error: "Aucun utilisateur trouvé" };
      authorId = fallbackAdmin.id;
    }

    await db.insert(comments).values({
      taskId: parsed.data.taskId,
      authorId,
      content: parsed.data.content,
    });

    revalidatePath("/tasks");
    await logActivity({ type: "comment_created", entityType: "task", entityId: parsed.data.taskId });
    await notifyAdmins({ type: "comment_created", message: "Nouveau commentaire sur une tâche", linkTo: `/tasks/${parsed.data.taskId}`, excludeUserId: session.userId });
    return { data: { success: true } };
  } catch (error) {
    console.error("[createCommentAction]", error);
    return { error: "Erreur serveur" };
  }
}

export async function deleteCommentAction(commentId: string): Promise<CommentActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé" };
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath("/tasks");
  return { data: { success: true } };
}

export async function getTaskComments(taskId: string) {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt));
  return rows;
}
