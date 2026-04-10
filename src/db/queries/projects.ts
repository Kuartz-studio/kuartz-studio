import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

/** List query — excludes logoBase64 for performance */
export async function getProjectsList() {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      url: projects.url,
      priority: projects.priority,
      targetDate: projects.targetDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects);
}

/** Detail query — includes logoBase64 */
export async function getProjectById(id: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return project ?? null;
}
