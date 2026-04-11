import { db } from "@/db";
import { fileAttachments, projects, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { FilesTable } from "@/components/files/FilesTable";

export default async function DocumentsFilesPage() {
  const files = await db
    .select({
      id: fileAttachments.id,
      title: fileAttachments.title,
      url: fileAttachments.url,
      fileFormat: fileAttachments.format,
      projectId: fileAttachments.projectId,
      projectName: projects.name,
      projectLogoBase64: projects.logoBase64,
      taskId: fileAttachments.taskId,
      authorName: users.name,
      authorAvatarBase64: users.avatarBase64,
      createdAt: fileAttachments.createdAt,
    })
    .from(fileAttachments)
    .leftJoin(projects, eq(fileAttachments.projectId, projects.id))
    .leftJoin(users, eq(fileAttachments.addedByUserId, users.id))
    .orderBy(desc(fileAttachments.createdAt));

  const allProjects = await db.select({ 
    id: projects.id, 
    name: projects.name, 
    logoBase64: projects.logoBase64 
  }).from(projects).orderBy(projects.name);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <FilesTable files={files} allProjects={allProjects} />
    </div>
  );
}
