"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, Link2, Trash2, Plus, Paperclip, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ProjectTag } from "@/components/projects/ProjectTag";
import { AvatarCustom } from "@/components/ui/table-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectSelect } from "@/components/projects/ProjectSelect";
import { createAttachmentAction, deleteAttachmentAction } from "@/actions/file-attachments";
import { IconGoogleDoc, IconGoogleSheet, IconGoogleDrive, IconFigma, IconNotion, IconGithub } from "@/components/ui/brand-icons";

const FORMAT_OPTIONS = [
  { value: "google_doc", label: "Google Doc", icon: <IconGoogleDoc className="w-4 h-4" /> },
  { value: "google_sheet", label: "Google Sheet", icon: <IconGoogleSheet className="w-4 h-4" /> },
  { value: "figma", label: "Figma", icon: <IconFigma className="w-4 h-4" /> },
  { value: "notion", label: "Notion", icon: <IconNotion className="w-4 h-4" /> },
  { value: "drive", label: "Google Drive", icon: <IconGoogleDrive className="w-4 h-4" /> },
  { value: "github", label: "GitHub", icon: <IconGithub className="w-4 h-4" /> },
  { value: "link", label: "Lien web", icon: <Link2 className="w-4 h-4" /> },
  { value: "other", label: "Autre", icon: <Paperclip className="w-4 h-4" /> },
] as const;

export interface FileRow {
  id: string;
  projectId: string | null;
  projectName: string | null;
  projectLogoBase64: string | null;
  taskId: string | null;
  authorName: string | null;
  authorAvatarBase64: string | null;
  title: string;
  url: string;
  fileFormat: string;
  createdAt: Date | null;
}

import { cn } from "@/lib/utils";

function SortableHeader({ label, sortKey, sortConfig, onSort, align = "left", className = "" }: { label: string, sortKey: string, sortConfig: { key: string, direction: "asc" | "desc" } | null, onSort: (key: string) => void, align?: "left" | "center" | "right", className?: string }) {
  return (
    <th className={cn("px-4 py-3 border-b border-[var(--color-border)]", className)}>
      <button 
        className={cn("flex items-center gap-1.5 text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide hover:text-[var(--color-foreground)] transition-colors outline-none", align === "center" && "mx-auto", align === "right" && "ml-auto")}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );
}

export function FilesTable({ files, allProjects }: { files: FileRow[]; allProjects: { id: string; name: string; logoBase64: string | null; }[] }) {
  const [isPending, startTransition] = useTransition();
  const [openAdd, setOpenAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileFormat, setFileFormat] = useState("link");
  const [projectId, setProjectId] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedFiles = useMemo(() => {
    if (!sortConfig) return files;
    return [...files].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case "title": valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); break;
        case "format": valA = a.fileFormat; valB = b.fileFormat; break;
        case "project": valA = a.projectName?.toLowerCase() ?? ""; valB = b.projectName?.toLowerCase() ?? ""; break;
        case "author": valA = a.authorName?.toLowerCase() ?? ""; valB = b.authorName?.toLowerCase() ?? ""; break;
        case "date": valA = a.createdAt ? new Date(a.createdAt).getTime() : 0; valB = b.createdAt ? new Date(b.createdAt).getTime() : 0; break;
        default: valA = 0; valB = 0;
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [files, sortConfig]);

  const getFormatInfo = (fmt: string) => FORMAT_OPTIONS.find(f => f.value === fmt) ?? { value: "other", label: "Autre", icon: "📎" };

  const handleOpenAdd = () => {
    setTitle("");
    setUrl("");
    setFileFormat("link");
    setProjectId(null);
    setOpenAdd(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const formData = new FormData();
    formData.set("title", title);
    formData.set("url", url);
    formData.set("format", fileFormat);
    if (projectId) {
      formData.set("projectId", projectId);
    }
    // Note: taskId is not supported in the global form right now, they attach from tasks page for tasks.

    startTransition(async () => {
      await createAttachmentAction({}, formData);
      setOpenAdd(false);
      // Let server action revalidate the path
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce fichier définitivement ?")) {
      startTransition(async () => {
        await deleteAttachmentAction(id);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fichiers & Liens</h1>
        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus size={16} /> Nouveau Document
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <SortableHeader label="Titre" sortKey="title" sortConfig={sortConfig} onSort={requestSort} className="text-left" />
                <SortableHeader label="Format" sortKey="format" sortConfig={sortConfig} onSort={requestSort} className="text-left w-36" />
                <SortableHeader label="Projet" sortKey="project" sortConfig={sortConfig} onSort={requestSort} className="text-left w-[25%]" />
                <SortableHeader label="Auteur" sortKey="author" sortConfig={sortConfig} onSort={requestSort} className="text-left w-48" />
                <SortableHeader label="Date" sortKey="date" sortConfig={sortConfig} onSort={requestSort} align="right" className="text-right w-36" />
                <th className="px-2 py-3 text-center w-12 border-b border-[var(--color-border)]"></th>
              </tr>
            </thead>
            <tbody className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {sortedFiles.map((file) => {
                const fmtInfo = getFormatInfo(file.fileFormat);
                return (
                  <tr key={file.id} onClick={() => window.open(file.url, "_blank")} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)] transition-colors group cursor-pointer">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {/* We remove the emoji from the title line, since icon is now in the format tag */}
                        <ExternalLink className="text-[var(--color-muted-foreground)] h-4 w-4 shrink-0" />
                        <span className="text-[13px] text-primary truncate block group-hover:underline group-hover:decoration-dashed group-hover:decoration-primary underline-offset-2">
                          {file.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 bg-muted rounded-md text-muted-foreground whitespace-nowrap">
                        {fmtInfo.icon}
                        <span>{fmtInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {file.projectId && file.projectName ? (
                        <ProjectTag name={file.projectName} logoBase64={file.projectLogoBase64} />
                      ) : (
                        <span className="italic opacity-50 text-[12px] text-[var(--color-muted-foreground)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {file.authorName ? (
                        <div className="flex items-center gap-2">
                          <AvatarCustom name={file.authorName} avatarBase64={file.authorAvatarBase64} />
                          <span className="text-[12px] font-medium text-[var(--color-foreground)] truncate">{file.authorName}</span>
                        </div>
                      ) : (
                        <span className="italic opacity-50 text-[12px] text-[var(--color-muted-foreground)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[12px] text-[var(--color-muted-foreground)]">
                        {file.createdAt ? format(new Date(file.createdAt), "d MMM yyyy", { locale: fr }) : "-"}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors outline-none mx-auto cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }} className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDelete(file.id, e)} className="cursor-pointer text-red-600 focus:bg-red-500/10 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {files.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                    Aucun fichier ou lien disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 mt-4">
            <Input 
              placeholder="Titre du document" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <Input 
              placeholder="URL (ex: https://drive.google.com/)" 
              type="url" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              required 
            />
            <Select value={fileFormat} onValueChange={(val) => setFileFormat(val || "link")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="mr-2">{opt.icon}</span> {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ProjectSelect 
              multiple={false}
              projects={allProjects as any}
              value={projectId}
              onChange={setProjectId}
              placeholder="Associer à un projet (facultatif)"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)}>Annuler</Button>
              <Button type="submit" disabled={isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
