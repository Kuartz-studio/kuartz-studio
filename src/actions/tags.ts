"use server";

import { db } from "@/db";
import { tags, taskTags } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function createTagAction(name: string, color: string, projectId?: string) {
  const session = await verifySession();
  if (!session) return null;

  try {
    const [tag] = await db.insert(tags).values({
      name, color
    }).returning();
    revalidatePath(`/tasks`);
    revalidatePath(`/projects/[slug]`, 'page');
    return tag;
  } catch(e) {
    return null;
  }
}

export async function updateTagColorAction(tagId: string, color: string) {
  const session = await verifySession();
  if (!session) return;
  await db.update(tags).set({ color }).where(eq(tags.id, tagId));
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
}

export async function deleteTagAction(tagId: string) {
  const session = await verifySession();
  if (!session) return;
  await db.delete(tags).where(eq(tags.id, tagId));
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
}

export async function updateTaskTagsAction(taskId: string, tagIds: string[]) {
  const session = await verifySession();
  if (!session) return;
  
  await db.delete(taskTags).where(eq(taskTags.taskId, taskId));
  if (tagIds.length > 0) {
    await db.insert(taskTags).values(tagIds.map(tagId => ({ taskId, tagId })));
  }
  revalidatePath(`/tasks`);
  revalidatePath(`/projects/[slug]`, 'page');
}
