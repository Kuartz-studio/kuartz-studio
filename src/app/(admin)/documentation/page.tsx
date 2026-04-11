import { db } from "@/db";
import { documents, projects, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DocumentsTable } from "@/components/documents/DocumentsTable";

export default async function DocumentsPage() {
  const allDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      slug: documents.slug,
      category: documents.category,
      content: documents.content,
      projectId: documents.projectId,
      projectName: projects.name,
      projectSlug: projects.slug,
      projectLogoBase64: projects.logoBase64,
      authorName: users.name,
      authorAvatarBase64: users.avatarBase64,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .leftJoin(projects, eq(documents.projectId, projects.id))
    .leftJoin(users, eq(documents.authorId, users.id))
    .orderBy(desc(documents.updatedAt));

  const allProjects = await db.select({ id: projects.id, name: projects.name, logoBase64: projects.logoBase64 }).from(projects).orderBy(projects.name);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      {/* We make the container wrap flex-1 so DocumentsTable stretches */}
      <DocumentsTable documents={allDocs as any} allProjects={allProjects} />
    </div>
  );
}
