"use server";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

// Helper to send a notification to a specific user
export async function sendNotification(params: {
  userId: string;
  type: string;
  message: string;
  linkTo?: string;
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    message: params.message,
    linkTo: params.linkTo || null,
  });
}

// Send notification to ALL admins/employees
export async function notifyAdmins(params: {
  type: string;
  message: string;
  linkTo?: string;
  excludeUserId?: string; // Don't notify the person who triggered the action
}) {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  const employees = await db.select({ id: users.id }).from(users).where(eq(users.role, "employee"));
  const allStaff = [...admins, ...employees];

  for (const user of allStaff) {
    if (params.excludeUserId && user.id === params.excludeUserId) continue;
    await sendNotification({
      userId: user.id,
      type: params.type,
      message: params.message,
      linkTo: params.linkTo,
    });
  }
}

// Get notifications for the current session user
export async function getMyNotifications(limit = 30) {
  const session = await verifySession();
  if (!session) return [];

  // Resolve to actual DB user
  let userId = session.userId;
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
  if (!existingUser) {
    const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
    if (!fallbackAdmin) return [];
    userId = fallbackAdmin.id;
  }

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount() {
  const session = await verifySession();
  if (!session) return 0;

  let userId = session.userId;
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
  if (!existingUser) {
    const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
    if (!fallbackAdmin) return 0;
    userId = fallbackAdmin.id;
  }

  const unread = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return unread.length;
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await verifySession();
  if (!session) return;

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
  revalidatePath("/");
}

export async function markAllReadAction() {
  const session = await verifySession();
  if (!session) return;

  let userId = session.userId;
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).limit(1);
  if (!existingUser) {
    const [fallbackAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
    if (!fallbackAdmin) return;
    userId = fallbackAdmin.id;
  }

  await db.update(notifications).set({ read: true }).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  revalidatePath("/");
}
