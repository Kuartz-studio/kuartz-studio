"use server";

import { db } from "@/db";
import { projects, projectToUser, users, tasks, documents, fileAttachments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";
import { insertProjectSchema } from "@/lib/validators/projects";
import { base64ImageSchema } from "@/lib/validators/image";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/actions";



export async function createProjectAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé à créer un projet" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertProjectSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, description } = parsed.data;
  const slug = parsed.data.slug || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  try {
    const existing = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (existing.length > 0) return { error: "Ce slug (URL) est déjà utilisé par un autre projet." };

    const [project] = await db.insert(projects).values({ name, slug, description }).returning();
    if (!project) return { error: "Erreur serveur lors de la création du projet" };
    
    // Le créateur est owner de ce projet
    await db.insert(projectToUser).values({ projectId: project.id, userId: session.userId, role: "owner" });

    revalidatePath("/projects");
  } catch (error) {
    return { error: "Erreur serveur lors de la création du projet" };
  }
  
  redirect(`/projects`);
}

// Preset task type
type PresetTask = {
  title: string;
  tag: string;
  assigneeIds: string[];
  status: string;
};

export async function createProjectWithPresetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) {
    return { error: "Non autorisé à créer un projet" };
  }

  const data = Object.fromEntries(formData);
  const parsed = insertProjectSchema.safeParse(data);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, description } = parsed.data;
  // Auto-generate slug from name
  let slug = name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  const presetTasksJson = formData.get("presetTasks") as string | null;
  const logoBase64 = formData.get("logoBase64") as string | null;
  const memberIds = formData.getAll("memberIds") as string[];
  const url = (formData.get("url") as string | null) || null;

  try {
    // Ensure slug uniqueness
    const existing = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const [project] = await db.insert(projects).values({
      name, slug, description, url,
      logoBase64: logoBase64 || null,
    }).returning();
    if (!project) return { error: "Erreur serveur lors de la création du projet" };

    // Owner
    await db.insert(projectToUser).values({ projectId: project.id, userId: session.userId, role: "owner" });

    // Project members
    if (memberIds.length > 0) {
      for (const memberId of memberIds) {
        if (memberId !== session.userId) {
          await db.insert(projectToUser).values({ projectId: project.id, userId: memberId, role: "member" });
        }
      }
    }

    // Preset tasks
    if (presetTasksJson) {
      const { tasks: tasksTable, taskAssignees, tags, taskTags } = await import("@/db/schema");
      const presetTasks: PresetTask[] = JSON.parse(presetTasksJson);

      // Get or create tags
      const existingTags = await db.select().from(tags);
      const tagMap = new Map(existingTags.map(t => [t.name.toLowerCase(), t]));

      const uniqueTagNames = [...new Set(presetTasks.map(t => t.tag.toLowerCase()))];
      const TAG_COLORS = ["#205CFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

      for (const tagName of uniqueTagNames) {
        if (!tagMap.has(tagName)) {
          const colorIndex = tagMap.size % TAG_COLORS.length;
          const [newTag] = await db.insert(tags).values({
            name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
            color: TAG_COLORS[colorIndex] || "#205CFF",
          }).returning();
          if (newTag) tagMap.set(tagName, newTag);
        }
      }

      // Track project members to avoid duplicates
      const projectMemberIds = new Set<string>([session.userId]);

      // Get latest issueNumber globally vs project? the previous codebase seems to use a global issueNumber across all tasks
      // because issueNumber is on the tasks table. Or maybe it's per project. Usually Jira-style is per project, but let's test global first.
      // Actually, if we look at schema, it just says issue_number. Let's make it global.
      const [latestTask] = await db.select({ num: tasksTable.issueNumber }).from(tasksTable).orderBy(desc(tasksTable.issueNumber)).limit(1);
      let nextIssueNumber = (latestTask?.num ?? 0) + 1;

      // Create tasks
      for (const preset of presetTasks) {
        const statusMap: Record<string, string> = { "Todo": "TODO", "Backlog": "BACKLOG", "In Progress": "IN_PROGRESS", "Done": "DONE" };
        const [newTask] = await db.insert(tasksTable).values({
          projectId: project.id,
          issueNumber: nextIssueNumber++,
          title: preset.title,
          status: statusMap[preset.status] || "TODO",
          priority: 0,
          createdByUserId: session.userId,
        }).returning();

        if (!newTask) continue;

        // Assignees (multiple)
        for (const userId of preset.assigneeIds) {
          await db.insert(taskAssignees).values({ taskId: newTask.id, userId });
          // Add user to project if not already
          if (!projectMemberIds.has(userId)) {
            await db.insert(projectToUser).values({ projectId: project.id, userId, role: "member" });
            projectMemberIds.add(userId);
          }
        }

        // Tag
        const tag = tagMap.get(preset.tag.toLowerCase());
        if (tag) {
          await db.insert(taskTags).values({ taskId: newTask.id, tagId: tag.id });
        }
      }
    }

    revalidatePath("/projects");
    revalidatePath("/tasks");
  } catch (error) {
    console.error("[createProjectWithPresetAction]", error);
    return { error: "Erreur serveur lors de la création du projet" };
  }

  redirect(`/projects`);
}

export async function deleteProjectAction(projectId: string) {
  const session = await verifySession();
  if (!session || session.role !== "admin") return;
  
  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectAction(projectId: string, data: { name?: string; url?: string | null; priority?: number }) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return { error: "Non autorisé" };

  try {
    await db.update(projects).set(data).where(eq(projects.id, projectId));
    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "Erreur lors de la mise à jour du projet" };
  }
}

export async function updateProjectUsersAction(projectId: string, userIds: string[]) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return { error: "Non autorisé" };

  try {
    await db.delete(projectToUser).where(eq(projectToUser.projectId, projectId));
    if (userIds.length > 0) {
      await db.insert(projectToUser).values(userIds.map(userId => ({ projectId, userId, role: "member" as const })));
    }
    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "Erreur lors de la mise à jour des utilisateurs" };
  }
}

export async function getProjectsWithUsers() {
  const allProjects = await db.select().from(projects);
  const allLinks = await db
    .select({ projectId: projectToUser.projectId, userId: projectToUser.userId, role: projectToUser.role, userName: users.name, userAvatar: users.avatarBase64 })
    .from(projectToUser)
    .leftJoin(users, eq(projectToUser.userId, users.id));

  // Fetch content counts for each project
  const allTasks = await db.select({ id: tasks.id, projectId: tasks.projectId, status: tasks.status }).from(tasks);
  const allDocs = await db.select({ id: documents.id, projectId: documents.projectId, category: documents.category }).from(documents);
  const allFiles = await db.select({ id: fileAttachments.id, projectId: fileAttachments.projectId }).from(fileAttachments);

  return allProjects.map(p => {
    const projectTasks = allTasks.filter(t => t.projectId === p.id);
    return {
      ...p,
      users: allLinks.filter(l => l.projectId === p.id).map(l => ({
        id: l.userId,
        name: l.userName,
        avatarBase64: l.userAvatar,
        role: l.role,
      })),
      contentCounts: {
        tasks: projectTasks.length,
        tasksDone: projectTasks.filter(t => t.status === "DONE").length,
        documents: allDocs.filter(d => d.projectId === p.id).length,
        files: allFiles.filter(f => f.projectId === p.id).length,
        documentCategories: allDocs.filter(d => d.projectId === p.id).reduce((acc, doc) => {
          const cat = doc.category || "Autre";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  });
}

export async function updateProjectLogoAction(projectId: string, base64: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return { error: "Non autorisé" };

  const parsed = base64ImageSchema.safeParse(base64);
  if (!parsed.success) return { error: "Image invalide" };

  try {
    await db.update(projects).set({ logoBase64: parsed.data }).where(eq(projects.id, projectId));
    revalidatePath("/projects");
    revalidatePath("/tasks");
    return { success: true };
  } catch {
    return { error: "Erreur lors de l'upload" };
  }
}

export async function updatePortalSettingsAction(projectId: string, settings: any) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  await db.update(projects).set({ portalSettings: settings }).where(eq(projects.id, projectId));
  revalidatePath("/projects", "layout");
}

export async function updatePortalSvgAction(projectId: string, svg: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  // Simple sanitize check (must start with <svg)
  if (svg && !svg.trim().toLowerCase().startsWith("<svg")) {
     return { error: "Code SVG invalide" };
  }

  await db.update(projects).set({ iconSvg: svg || null }).where(eq(projects.id, projectId));
  revalidatePath(`/projects`);
  return { success: true };
}

export async function regeneratePortalTokenAction(projectId: string) {
  const session = await verifySession();
  if (!session || (session.role !== "admin" && session.role !== "employee")) return;

  const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  await db.update(projects).set({ clientPortalToken: newToken }).where(eq(projects.id, projectId));
  revalidatePath(`/projects`);
}
