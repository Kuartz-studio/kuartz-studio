import { db } from "@/db";
import { tasks, projects, users, taskAssignees, taskTags, tags as dbTags, projectToUser } from "@/db/schema";
import { desc, eq, like, or, and, inArray, notInArray } from "drizzle-orm";
import { TasksTable } from "@/components/tasks/TasksTable";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";
import { verifySession } from "@/lib/auth/session";

export default async function GlobalTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const q = params.q as string | undefined;
  const projectId = params.projectId as string | undefined;
  const assignee = params.assignee as string | undefined;
  const priority = params.priority as string | undefined;
  const tag = params.tag as string | undefined;
  const status = params.status as string | undefined;

  const session = await verifySession();

  const allProjects = await db.select({ id: projects.id, name: projects.name, slug: projects.slug, logoBase64: projects.logoBase64 }).from(projects);
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, avatarBase64: users.avatarBase64, role: users.role }).from(users);
  
  const allTagsRows = await db.select({ name: dbTags.name }).from(dbTags);
  const tags: string[] = Array.from(new Set(allTagsRows.map(t => t.name)));

  let query = db.select().from(tasks).$dynamic();
  
  const conditions = [];
  
  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId));
  }
  
  if (priority) {
    conditions.push(eq(tasks.priority, Number(priority)));
  }

  if (status) {
    if (status === "active") {
      conditions.push(notInArray(tasks.status, ["DONE", "CANCELED"]));
    } else if (status !== "all") {
      conditions.push(eq(tasks.status, status as any));
    }
  }

  if (q) {
    const qNum = parseInt(q, 10);
    if (!isNaN(qNum)) {
      conditions.push(or(eq(tasks.issueNumber, qNum), like(tasks.title, `%${q}%`)));
    } else {
      conditions.push(like(tasks.title, `%${q}%`));
    }
  }
  
  if (assignee) {
    const matching = await db.select({ taskId: taskAssignees.taskId }).from(taskAssignees).where(eq(taskAssignees.userId, assignee));
    const ids = matching.map(m => m.taskId);
    if (ids.length > 0) conditions.push(inArray(tasks.id, ids));
    else conditions.push(eq(tasks.id, "NONE"));
  }

  if (tag) {
    const matching = await db.select({ taskId: taskTags.taskId }).from(taskTags).where(eq(taskTags.tagId, tag));
    const ids = matching.map(m => m.taskId);
    if (ids.length > 0) conditions.push(inArray(tasks.id, ids));
    else conditions.push(eq(tasks.id, "NONE"));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const fetchedTasks = await query.orderBy(desc(tasks.issueNumber));

  const fetchedTaskIds = fetchedTasks.length > 0 ? fetchedTasks.map(t => t.id) : ["NONE"];

  const [allTaskAssignees, allTaskTags] = await Promise.all([
    db.select().from(taskAssignees).where(inArray(taskAssignees.taskId, fetchedTaskIds)),
    db.select().from(taskTags).where(inArray(taskTags.taskId, fetchedTaskIds))
  ]);
  
  const allTagsWithColor = await db.select().from(dbTags);

  const enrichedTasks = fetchedTasks.map(task => {
    const project = allProjects.find(p => p.id === task.projectId);
    
    // Aggregate Assignees
    const tAssigneesIds = allTaskAssignees.filter(ta => ta.taskId === task.id).map(ta => ta.userId);
    const usersForTask = allUsers.filter(u => tAssigneesIds.includes(u.id));
    const assignees = usersForTask.map(u => ({ user: u }));

    // Aggregate Tags
    const tTagIds = allTaskTags.filter(tt => tt.taskId === task.id).map(tt => tt.tagId);
    const tagsForTask = allTagsWithColor.filter(t => tTagIds.includes(t.id));
    const tags = tagsForTask.map(t => ({ tag: t }));

    return {
      ...task,
      targetDate: task.targetDate ? task.targetDate.toISOString() : null,
      projectName: project?.name || "Projet Inconnu",
      projectSlug: project?.slug || "",
      projectLogoBase64: project?.logoBase64 ?? null,
      assignees,
      tags
    };
  });

  // User array expects avatarBase64 and email for AssigneeCell
  const usersForDropdown = allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, avatarBase64: u.avatarBase64, role: u.role }));

  // Build projectId → userId[] map for project-scoped assignees
  const allProjectUsers = await db.select({ projectId: projectToUser.projectId, userId: projectToUser.userId }).from(projectToUser);
  const projectUserMap: Record<string, string[]> = {};
  for (const pu of allProjectUsers) {
    if (!projectUserMap[pu.projectId]) projectUserMap[pu.projectId] = [];
    projectUserMap[pu.projectId]!.push(pu.userId);
  }

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground">Vue globale de toutes les tâches du studio.</p>
        </div>
        <NewTaskDialog projects={allProjects} users={usersForDropdown} projectUserMap={projectUserMap} allTags={allTagsWithColor} />
      </div>

      <div className="bg-card p-4 rounded-xl border flex flex-col gap-4">
        <TaskFilters projects={allProjects} users={allUsers} tags={tags} />
      </div>

      <TasksTable 
        tasks={enrichedTasks}
        allTags={allTagsWithColor}
        allUsers={usersForDropdown}
        allProjects={allProjects}
        projectUserMap={projectUserMap}
        currentUserId={session?.userId}
      />
    </div>
  );
}

