import { db } from "@/db";
import { tasks, projects, users, taskAssignees, taskTags, tags as dbTags } from "@/db/schema";
import { desc, eq, like, or, and, inArray } from "drizzle-orm";
import { TasksTable } from "@/components/tasks/TasksTable";
import { TaskFilters } from "@/components/tasks/TaskFilters";

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

  const allProjects = await db.select({ id: projects.id, name: projects.name, slug: projects.slug }).from(projects);
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl, role: users.role }).from(users);
  
  const allTagsRows = await db.select({ name: dbTags.name }).from(dbTags);
  const tags: string[] = Array.from(new Set(allTagsRows.map(t => t.name)));

  let query = db.select().from(tasks).$dynamic();
  
  const conditions = [];
  
  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId));
  }
  
  if (priority) {
    conditions.push(eq(tasks.priority, priority as any));
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
      assignees,
      tags
    };
  });

  // User array expects avatarUrl and email for AssigneeCell
  const usersForDropdown = allUsers.map(u => ({ ...u, email: "", avatarUrl: null, role: "employee" }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
        <p className="text-muted-foreground">Vue globale de toutes les tâches du studio.</p>
      </div>

      <div className="bg-card p-4 rounded-xl border flex flex-col gap-4">
        <TaskFilters projects={allProjects} users={allUsers} tags={tags} />
      </div>

      <TasksTable 
        tasks={enrichedTasks}
        allTags={allTagsWithColor}
        allUsers={usersForDropdown}
        allProjects={allProjects}
      />
    </div>
  );
}
