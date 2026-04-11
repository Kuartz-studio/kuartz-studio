"use client";

import { useState, useEffect, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Trash2, Save } from "lucide-react";
import { createDocumentAction, updateDocumentTitleAction, updateDocumentContentAction, deleteDocumentAction, linkDocumentToProjectAction } from "@/actions/documents";
import { ProjectSelect } from "@/components/projects/ProjectSelect";

// Shape expected from db
interface SheetDoc {
  id?: string;
  title?: string;
  content?: string | null;
  projectId?: string | null;
}

export function DocumentSheet({ 
  open, 
  onOpenChange, 
  document, 
  mode,
  allProjects = [],
  prefillTaskId
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  document?: SheetDoc | null;
  mode: "create" | "edit";
  allProjects?: { id: string; name: string }[];
  prefillTaskId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(document?.title || "");
      setContent(document?.content || "");
      setProjectId(document?.projectId || "");
    }
  }, [open, document]);

  const handleSave = () => {
    startTransition(async () => {
      if (mode === "create") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (projectId) formData.append("projectId", projectId);
        if (prefillTaskId) formData.append("taskId", prefillTaskId);

        const res = await createDocumentAction({}, formData);
        if (res?.data?.success) {
          onOpenChange(false);
        } else {
          alert(res?.error || "Erreur lors de la création");
        }
      } else if (mode === "edit" && document?.id) {
        if (title !== document.title) {
          await updateDocumentTitleAction(document.id, title);
        }
        if (content !== document.content) {
          await updateDocumentContentAction(document.id, content);
        }
        if (projectId !== document.projectId && allProjects.length > 0) {
          await linkDocumentToProjectAction(document.id, projectId);
        }
        onOpenChange(false);
      }
    });
  };

  const handleDelete = () => {
    if (!document?.id) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
      startTransition(async () => {
        await deleteDocumentAction(document.id!);
        onOpenChange(false);
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] xl:max-w-[1000px] px-0 flex flex-col gap-0 border-l border-[var(--color-border)] shadow-xl" side="right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex flex-col gap-4 bg-[var(--color-background)] shrink-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              {mode === "create" ? "Nouveau Document" : "Édition du Document"}
            </h2>
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8">
                  <Trash2 size={16} />
                </Button>
              )}
              <Button onClick={handleSave} disabled={isPending || (!title.trim() && mode === 'create')} className="gap-2 h-8">
                <Save size={16} />
                {isPending ? "Attente..." :  "Enregistrer"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du document..."
                className="font-medium bg-transparent shadow-none border-dashed focus-visible:ring-1"
              />
            </div>
            {allProjects.length > 0 && (
              <div className="w-[200px] shrink-0">
                <ProjectSelect
                  multiple={false}
                  value={projectId || null}
                  onChange={(val) => setProjectId(val || "")}
                  projects={allProjects as any}
                  placeholder="Attacher à un projet..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-card flex flex-col min-h-0 bg-background">
          <RichTextEditor
            content={content}
            onChange={(html) => setContent(html)}
            placeholder="Commencez à écrire ici..."
            className="border-none rounded-none shadow-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
