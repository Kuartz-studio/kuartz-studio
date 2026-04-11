import { db } from "@/db";
import { projects, projectToUser, users, tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { ClientPortalRoot } from "@/components/client-portal/ClientPortalRoot";

export const dynamic = "force-dynamic";

/**
 * Parse the composite URL param: "slug-token"
 * The slug can contain dashes, so we match the last 12 characters as the token.
 */
function parseProjectParam(param: string): { slug: string; token: string } | null {
  // Token is always the last 12 hex chars
  if (param.length < 14) return null; // at least 1 char slug + dash + 12 char token
  const token = param.slice(-12);
  const slug = param.slice(0, -(12 + 1)); // Remove "-token" from end
  if (!slug || !token) return null;
  return { slug, token };
}

export default async function ClientPortalPage({ params }: { params: Promise<{ projectParam: string }> }) {
  const { projectParam } = await params;
  const parsed = parseProjectParam(projectParam);

  if (!parsed) notFound();

  const { slug, token } = parsed;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.clientPortalToken, token)))
    .limit(1);

  if (!project) notFound();

  const session = await verifySession();
  const isAdmin = session?.role === "admin" || session?.role === "employee";

  const customerLinks = await db
    .select({
      userId: projectToUser.userId,
      role: projectToUser.role,
    })
    .from(projectToUser)
    .where(eq(projectToUser.projectId, project.id));

  const customerUserIds = customerLinks
    .filter((link) => link.role === "viewer" || link.role === "member")
    .map((link) => link.userId);

  let customerUsers: { id: string; name: string; avatarBase64: string | null; email: string }[] = [];

  if (customerUserIds.length > 0) {
    const allProjectUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarBase64: users.avatarBase64,
        role: users.role,
      })
      .from(users);

    customerUsers = allProjectUsers
      .filter((u) => customerUserIds.includes(u.id) && u.role === "customer")
      .map(({ id, name, avatarBase64, email }) => ({ id, name, avatarBase64, email }));
  }

  const allTasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.projectId, project.id));

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "DONE").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <ClientPortalRoot
      project={project}
      customers={customerUsers}
      isAdmin={isAdmin}
      progressStats={{
        total: totalTasks,
        done: doneTasks,
        percent: progressPercent
      }}
    />
  );
}
