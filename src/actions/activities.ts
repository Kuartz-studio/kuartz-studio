"use server";

import { db } from "@/db";
import { activities, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

async function resolveUserId(sessionUserId: string): Promise<string | null> {
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, sessionUserId)).limit(1);
  if (existingUser) return existingUser.id;
  const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  return fallbackAdmin?.id || null;
}

export async function logActivity(params: {
  type: string;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  metadata?: Record<string, unknown>;
}) {
  const session = await verifySession();
  if (!session) return;

  const userId = await resolveUserId(session.userId);
  if (!userId) return;

  await db.insert(activities).values({
    type: params.type,
    entityType: params.entityType,
    entityId: params.entityId,
    entityTitle: params.entityTitle || null,
    userId,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  });
}

export async function getRecentActivities(limit = 50) {
  return db
    .select({
      id: activities.id,
      type: activities.type,
      entityType: activities.entityType,
      entityId: activities.entityId,
      entityTitle: activities.entityTitle,
      metadata: activities.metadata,
      read: activities.read,
      createdAt: activities.createdAt,
      userId: activities.userId,
      userName: users.name,
      userAvatar: users.avatarBase64,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}

export async function markActivityReadAction(activityId: string) {
  const session = await verifySession();
  if (!session) return;
  await db.update(activities).set({ read: true }).where(eq(activities.id, activityId));
  revalidatePath("/activity");
}

export async function markAllActivitiesReadAction() {
  const session = await verifySession();
  if (!session) return;
  await db.update(activities).set({ read: true }).where(eq(activities.read, false));
  revalidatePath("/activity");
}

