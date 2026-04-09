import { db } from "@/db";
import { documents, projects, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { NewDocumentDialog } from "@/components/documents/NewDocumentDialog";
import { FileText, ChevronRight } from "lucide-react";

export default async function DocumentsPage() {
  const allDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      slug: documents.slug,
      projectId: documents.projectId,
      projectName: projects.name,
      projectSlug: projects.slug,
      authorName: users.name,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .leftJoin(projects, eq(documents.projectId, projects.id))
    .leftJoin(users, eq(documents.authorId, users.id))
    .orderBy(desc(documents.updatedAt));

  const allProjects = await db.select({ id: projects.id, name: projects.name }).from(projects).orderBy(projects.name);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <NewDocumentDialog projects={allProjects} />
      </div>

      <div className="bg-card rounded-md border flex flex-col divide-y">
        {allDocs.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Aucun document. Cliquez sur &quot;Nouveau Document&quot; pour commencer.
          </div>
        ) : (
          allDocs.map(doc => (
            <Link
              key={doc.id}
              href={`/documents/${doc.slug}`}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground" size={20} />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{doc.title}</span>
                  {doc.projectName && (
                    <span className="text-xs text-muted-foreground">{doc.projectName}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{doc.authorName}</span>
                <span>{doc.updatedAt?.toLocaleDateString("fr-FR")}</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
