import "dotenv/config";
import { db } from "./index";
import { users, projects, tasks, tags, taskTags, taskAssignees, projectToUser } from "./schema";
import { seedUsers, seedProjects, seedTasks } from "./legacy-data";

async function main() {
  console.log("Seeding legacy data...");

  // Insert Users
  for (const u of seedUsers) {
    await db.insert(users).values({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      role: u.role.toLowerCase() as "admin" | "employee" | "customer",
    }).onConflictDoNothing();
  }
  
  // Insert Projects and ProjectToUser
  for (const p of seedProjects) {
    await db.insert(projects).values({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      url: p.url,
      logoUrl: p.logoUrl,
      priority: p.priority,
      targetDate: p.targetDate ? new Date(p.targetDate) : null,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    }).onConflictDoNothing();

    if (p.users && p.users.length > 0) {
      for (const pu of p.users) {
        await db.insert(projectToUser).values({
          projectId: p.id,
          userId: pu.id,
          role: "member"
        }).onConflictDoNothing();
      }
    }
  }

  for (const u of seedUsers) {
    if (u.projects && u.projects.length > 0) {
      for (const up of u.projects) {
        await db.insert(projectToUser).values({
          projectId: up.id,
          userId: u.id,
          role: "member"
        }).onConflictDoNothing();
      }
    }
  }

  const existingTags = new Set();

  for (const t of seedTasks) {
    await db.insert(tasks).values({
      id: t.id,
      projectId: t.projectId,
      issueNumber: t.issueNumber,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdByUserId: t.createdByUserId,
      targetDate: t.targetDate ? new Date(t.targetDate) : null,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }).onConflictDoNothing();

    if (t.assignees) {
      for (const a of t.assignees) {
        await db.insert(taskAssignees).values({
          taskId: t.id,
          userId: a.userId
        }).onConflictDoNothing();
      }
    }

    if (t.tags) {
      for (const tg of t.tags) {
        const rawTag = tg.tag;
        if (!existingTags.has(rawTag.id)) {
          await db.insert(tags).values({
            id: rawTag.id,
            projectId: rawTag.projectId,
            name: rawTag.name,
            color: rawTag.color
          }).onConflictDoNothing();
          existingTags.add(rawTag.id);
        }
        await db.insert(taskTags).values({
          taskId: t.id,
          tagId: rawTag.id
        }).onConflictDoNothing();
      }
    }
  }

  console.log("Legacy Seeding complete.");
}

main().catch(console.error);
