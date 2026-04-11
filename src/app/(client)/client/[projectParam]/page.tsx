import { db } from "@/db";
import { projects, projectToUser, users, tasks, taskAssignees, taskTags, tags as dbTags, comments, documents } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
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

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id)).orderBy(desc(tasks.issueNumber));
  const fetchedTaskIds = projectTasks.length > 0 ? projectTasks.map(t => t.id) : ["NONE"];

  const [allTaskAssignees, allTaskTags, allUsersRows, allTagsWithColor, allComments] = await Promise.all([
    db.select().from(taskAssignees).where(inArray(taskAssignees.taskId, fetchedTaskIds)),
    db.select().from(taskTags).where(inArray(taskTags.taskId, fetchedTaskIds)),
    db.select({ id: users.id, name: users.name, email: users.email, avatarBase64: users.avatarBase64, role: users.role }).from(users),
    db.select().from(dbTags),
    db.select().from(comments).where(inArray(comments.taskId, fetchedTaskIds))
  ]);

  const enrichedTasks = projectTasks.map(task => {
    const tAssigneesIds = allTaskAssignees.filter(ta => ta.taskId === task.id).map(ta => ta.userId);
    const usersForTask = allUsersRows.filter(u => tAssigneesIds.includes(u.id));
    const assignees = usersForTask.map(u => ({ user: u }));

    const tTagIds = allTaskTags.filter(tt => tt.taskId === task.id).map(tt => tt.tagId);
    const tagsForTask = allTagsWithColor.filter(t => tTagIds.includes(t.id));
    const tags = tagsForTask.map(t => ({ tag: t }));

    const taskComments = allComments
      .filter(c => c.taskId === task.id)
      .map(c => ({
        ...c,
        author: allUsersRows.find(u => u.id === c.authorId) || null,
        createdAt: c.createdAt ? c.createdAt.toISOString() : null,
      }));

    return {
      ...task,
      targetDate: task.targetDate ? task.targetDate.toISOString() : null,
      projectName: project.name,
      projectSlug: project.slug,
      projectLogoBase64: project.logoBase64,
      assignees,
      tags,
      comments: taskComments,
    };
  });

  const totalTasks = enrichedTasks.length;
  const doneTasks = enrichedTasks.filter((t) => t.status === "DONE").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Build same shape expected by TasksTable
  // Include all project-linked users + all admin/employee users (always assignable)
  const allProjectLinkedUserIds = customerLinks.map(pm => pm.userId);
  const adminEmployeeIds = allUsersRows
    .filter(u => u.role === "admin" || u.role === "employee")
    .map(u => u.id);
  const allAssignableIds = [...new Set([...allProjectLinkedUserIds, ...adminEmployeeIds])];
  const projectUserMap: Record<string, string[]> = {
    [project.id]: allAssignableIds,
  };
  const usersForDropdown = allUsersRows.map(u => ({ ...u }));

  const projectDocs = await db.select().from(documents).where(eq(documents.projectId, project.id)).orderBy(documents.order);
  const serializedDocs = projectDocs.map(doc => ({
    ...doc,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  }));

  const { fileAttachments } = await import("@/db/schema");
  const projectFiles = await db.select().from(fileAttachments).where(eq(fileAttachments.projectId, project.id)).orderBy(desc(fileAttachments.createdAt));
  const serializedFiles = projectFiles.map(f => ({ ...f, createdAt: f.createdAt ? f.createdAt.toISOString() : null }));

  return (
    <ClientPortalRoot
      project={project}
      customers={customerUsers}
      isAdmin={isAdmin}
      adminId={session?.userId || null}
      tasks={enrichedTasks}
      allTags={allTagsWithColor}
      allUsers={usersForDropdown}
      allProjects={[project]}
      projectUserMap={projectUserMap}
      documents={serializedDocs}
      files={serializedFiles}
      progressStats={{
        total: totalTasks,
        done: doneTasks,
        percent: progressPercent
      }}
    />
  );
}
