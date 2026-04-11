"use client";

import { useState, useEffect, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Trash2, Save } from "lucide-react";
import { createDocumentAction, updateDocumentTitleAction, updateDocumentContentAction, deleteDocumentAction, linkDocumentToProjectAction, updateDocumentCategoryAction } from "@/actions/documents";
import { ProjectSelect } from "@/components/projects/ProjectSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Shape expected from db
interface SheetDoc {
  id?: string;
  title?: string;
  content?: string | null;
  projectId?: string | null;
  category?: string | null;
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
  const [category, setCategory] = useState("Autre");

  useEffect(() => {
    if (open) {
      setTitle(document?.title || "");
      setContent(document?.content || "");
      setProjectId(document?.projectId || "");
      setCategory(document?.category || "Autre");
    }
  }, [open, document]);

  const handleProjectChange = (val: string | null) => {
    const newProjectId = val || "";
    
    // Auto-replace project name in content if switching from one valid project to another
    if (projectId && newProjectId && projectId !== newProjectId && content && allProjects) {
      const oldProject = allProjects.find(p => p.id === projectId);
      const newProject = allProjects.find(p => p.id === newProjectId);
      
      if (oldProject && newProject) {
        // Find & replace old brand name with new brand name globally and case-insensitively
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapeRegExp(oldProject.name), 'gi');
        setContent(prev => prev.replace(regex, newProject.name));
        setTitle(prev => prev.replace(regex, newProject.name));
      }
    }
    
    setProjectId(newProjectId);
  };

  const handleSave = () => {
    startTransition(async () => {
      if (mode === "create") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
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
        if (content !== (document.content || "")) {
          await updateDocumentContentAction(document.id, content);
        }
        if (category !== (document.category || "Autre")) {
          await updateDocumentCategoryAction(document.id, category);
        }
        const oldProjectId = document.projectId || "";
        if (projectId !== oldProjectId && allProjects.length > 0) {
          await linkDocumentToProjectAction(document.id, projectId || null);
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
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-[140px]">
                  <Select value={category} onValueChange={(v) => setCategory(v || "Autre")}>
                    <SelectTrigger className="shadow-none border-dashed bg-transparent h-10 w-full focus:ring-1">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Autre">Autre</SelectItem>
                      <SelectItem value="Framer">Framer</SelectItem>
                      <SelectItem value="Webflow">Webflow</SelectItem>
                      <SelectItem value="Figma">Figma</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Copywriting">Copywriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <ProjectSelect
                    multiple={false}
                    value={projectId || null}
                    onChange={handleProjectChange}
                    projects={allProjects as any}
                    placeholder="Attacher à un projet..."
                  />
                </div>
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
