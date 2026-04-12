/**
 * One-shot script: Add all admin users to project_to_user for every project.
 * Run from project root: npx tsx scripts/add-admins-to-projects.ts
 */
import { db } from "@/db";
import { users, projects, projectToUser } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const adminUsers = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.role, "admin"));
  const allProjects = await db.select({ id: projects.id, name: projects.name }).from(projects);

  console.log(`Found ${adminUsers.length} admin(s) and ${allProjects.length} project(s).`);

  let inserted = 0;
  let skipped = 0;

  for (const admin of adminUsers) {
    for (const project of allProjects) {
      // Check if already linked
      const [existing] = await db
        .select()
        .from(projectToUser)
        .where(and(eq(projectToUser.projectId, project.id), eq(projectToUser.userId, admin.id)))
        .limit(1);

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(projectToUser).values({
        projectId: project.id,
        userId: admin.id,
        role: "owner",
      });
      inserted++;
      console.log(`  ✅ Added ${admin.name} → ${project.name} (role: owner)`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped (already exists): ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
