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

      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col flex-1">
        {allDocs.length === 0 ? (
          <div className="text-center p-8 pb-12 text-sm text-[var(--color-muted-foreground)] m-auto">
            Aucun document. Cliquez sur &quot;Nouveau Document&quot; pour commencer.
          </div>
        ) : (
          <table className="text-sm border-collapse w-full relative table-fixed">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Titre</span>
                </th>
                <th className="px-4 py-3 text-left w-[25%] border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Projet</span>
                </th>
                <th className="px-4 py-3 text-left w-32 border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Auteur</span>
                </th>
                <th className="px-4 py-3 text-right w-32 border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Date</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {allDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group cursor-pointer relative">
                  <td className="px-4 py-2">
                    <Link href={`/documents/${doc.slug}`} className="absolute inset-0 z-10" />
                    <div className="flex items-center gap-2">
                       <FileText className="text-[var(--color-muted-foreground)] h-4 w-4 shrink-0" />
                       <span className="text-[13px] font-medium text-[var(--color-foreground)] truncate block group-hover:underline group-hover:decoration-dashed group-hover:decoration-[var(--color-muted-foreground)] underline-offset-2">
                         {doc.title}
                       </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[12px] text-[var(--color-muted-foreground)] truncate block">
                      {doc.projectName || <span className="italic opacity-50">-</span>}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[12px] text-[var(--color-muted-foreground)] truncate block">
                      {doc.authorName}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-[12px] text-[var(--color-muted-foreground)]">
                      {doc.updatedAt?.toLocaleDateString("fr-FR")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
