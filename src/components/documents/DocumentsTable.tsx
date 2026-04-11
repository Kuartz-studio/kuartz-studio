"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PanelRight, FileText, Plus, CopyPlus, Trash2, PenLine } from "lucide-react";
import { DocumentSheet } from "@/components/documents/DocumentSheet";
import { deleteDocumentAction } from "@/actions/documents";
import { ProjectTag } from "@/components/projects/ProjectTag";
import { AvatarCustom } from "@/components/ui/table-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types matching the query in page.tsx
interface DocRow {
  id: string;
  title: string;
  slug: string;
  projectId: string | null;
  projectName: string | null;
  projectSlug: string | null;
  projectLogoBase64: string | null;
  authorName: string | null;
  authorAvatarBase64: string | null;
  updatedAt: Date | null;
  category?: string | null;
  content?: string | null;
}

const categoryColors: Record<string, string> = {
  Framer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Webflow: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Figma: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Branding: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Design: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Copywriting: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Autre: "bg-muted text-muted-foreground border-transparent",
};

export function DocumentsTable({ documents, allProjects }: { documents: DocRow[]; allProjects: { id: string; name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | null>(null);
  
  // Active document being edited or created
  const [activeDoc, setActiveDoc] = useState<Partial<DocRow> | null>(null);

  const handleOpenCreate = () => {
    setActiveDoc({});
    setSheetMode("create");
  };

  const handleOpenEdit = async (doc: DocRow) => {
    setActiveDoc(doc);
    setSheetMode("edit");
  };

  const handleClose = () => {
    setSheetMode(null);
    setActiveDoc(null);
  };

  const handleDuplicate = (doc: DocRow) => {
    setActiveDoc({
      ...doc,
      id: undefined, // ensure it's treated as new
      title: `${doc.title} copy`
    });
    setSheetMode("create");
  };

  const handleDelete = (doc: DocRow) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${doc.title}" ?`)) {
      startTransition(async () => {
        await deleteDocumentAction(doc.id);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={16} /> Nouveau Document
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col flex-1">
        {documents.length === 0 ? (
          <div className="text-center p-8 pb-12 text-sm text-[var(--color-muted-foreground)] m-auto">
            Aucun document. Cliquez sur &quot;Nouveau Document&quot; pour commencer.
          </div>
        ) : (
          <table className="text-sm border-collapse w-full relative table-fixed">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Titre</span>
                </th>
                <th className="px-4 py-3 text-left w-[20%] border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Projet</span>
                </th>
                <th className="px-4 py-3 text-left w-32 border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Catégorie</span>
                </th>
                <th className="px-4 py-3 text-left w-48 border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Auteur</span>
                </th>
                <th className="px-4 py-3 text-right w-36 border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Date</span>
                </th>
                <th className="px-4 py-3 text-center w-24 border-b border-[var(--color-border)]">
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} onClick={() => handleOpenEdit(doc)} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)] transition-colors group cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                       <FileText className="text-[var(--color-muted-foreground)] h-4 w-4 shrink-0" />
                       <span className="text-[13px] text-[var(--color-foreground)] truncate block group-hover:underline group-hover:decoration-dashed group-hover:decoration-[var(--color-muted-foreground)] underline-offset-2">
                         {doc.title}
                       </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {doc.projectId && doc.projectName ? (
                      <ProjectTag name={doc.projectName} logoBase64={doc.projectLogoBase64} />
                    ) : (
                      <span className="italic opacity-50 text-[12px] text-[var(--color-muted-foreground)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border inline-block ${categoryColors[doc.category || "Autre"] || categoryColors.Autre}`}>
                      {doc.category || "Autre"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {doc.authorName ? (
                      <div className="flex items-center gap-2">
                        <AvatarCustom name={doc.authorName} avatarBase64={doc.authorAvatarBase64} />
                        <span className="text-[12px] font-medium text-[var(--color-foreground)] truncate">{doc.authorName}</span>
                      </div>
                    ) : (
                      <span className="italic opacity-50 text-[12px] text-[var(--color-muted-foreground)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[12px] text-[var(--color-muted-foreground)]">
                      {doc.updatedAt ? format(new Date(doc.updatedAt), "d MMM yyyy", { locale: fr }) : "-"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(doc); }}
                        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors p-1.5 rounded-md"
                        title="Dupliquer le document"
                      >
                        <CopyPlus size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(doc); }}
                        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors p-1.5 rounded-md"
                        title="Éditer le document"
                      >
                        <PenLine size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                        className="text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors p-1.5 rounded-md"
                        title="Supprimer le document"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Sidebar (Sheet) */}
      <DocumentSheet
        open={sheetMode !== null}
        onOpenChange={(open) => !open && handleClose()}
        mode={sheetMode || "create"}
        document={activeDoc}
        allProjects={allProjects}
      />
    </div>
  );
}
