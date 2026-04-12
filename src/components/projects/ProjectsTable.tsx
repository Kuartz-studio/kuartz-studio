"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { PenLine, Trash2, Check, ExternalLink, FolderKanban, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarCustom, PriorityIcon } from "@/components/ui/table-icons";
import { updateProjectAction, updateProjectUsersAction, updateProjectLogoAction, deleteProjectAction } from "@/actions/projects";
import { ImageUpload } from "@/components/shared/ImageUpload";
import Link from "next/link";
import { PortalSettingsForm } from "@/components/client-portal/PortalSettingsForm";

// Types
interface ProjectUser { id: string; name: string | null; avatarBase64: string | null; role: string; }
interface UserRecord { id: string; name: string; avatarBase64: string | null; role: string; }
interface ProjectRow {
  id: string; name: string; slug: string; description: string | null;
  url: string | null; logoBase64: string | null; priority: number | null;
  clientPortalToken: string | null;
  iconSvg: string | null;
  portalSettings: any | null;
  users: ProjectUser[];
  contentCounts: { tasks: number; tasksDone: number; documents: number; files: number };
}

const PRIORITY_OPTIONS = [
  { value: 0, label: "Aucune" },
  { value: 1, label: "Basse" },
  { value: 2, label: "Moyenne" },
  { value: 3, label: "Haute" },
  { value: 4, label: "Urgente" },
];

// ---------------------------------------------------------------------------
// Editable Text Cell
// ---------------------------------------------------------------------------
function EditableTextCell({ value, onSave, placeholder, className }: { value: string; onSave: (v: string) => void; placeholder?: string; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        placeholder={placeholder}
        className="h-7 text-[13px] bg-transparent border-[var(--color-border)] focus:ring-1"
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-[13px] whitespace-nowrap block cursor-pointer hover:bg-[var(--color-muted)] px-1 -mx-1 py-0.5 rounded transition-colors ${className ?? ""}`}
    >
      {value}
    </span>
  );
}

// ---------------------------------------------------------------------------
// URL Cell (inline editable + external link)
// ---------------------------------------------------------------------------
function UrlCell({ value, onSave }: { value: string | null; onSave: (url: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const commit = () => {
    const trimmed = draft.trim();
    onSave(trimmed || null);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        placeholder="https://..."
        className="h-7 text-[12px] bg-transparent border-[var(--color-border)] focus:ring-1"
      />
    );
  }

  if (!value) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="text-[12px] text-[var(--color-muted-foreground)]/50 italic cursor-pointer hover:text-[var(--color-muted-foreground)] transition-colors"
      >
        Aucun lien
      </span>
    );
  }

  const displayName = (() => {
    try {
      const u = new URL(value.startsWith("http") ? value : `https://${value}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return value;
    }
  })();

  const fullUrl = value.startsWith("http") ? value : `https://${value}`;

  return (
    <div className="flex items-center gap-1.5 group/url">
      <span
        onClick={() => setEditing(true)}
        className="text-[12px] text-[var(--color-muted-foreground)] cursor-pointer hover:text-[var(--color-foreground)] transition-colors truncate"
      >
        {displayName}
      </span>
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Priority Cell
// ---------------------------------------------------------------------------
function PriorityCell({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer outline-none">
        <PriorityIcon value={value} />
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-1" align="start">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { onSave(opt.value); setOpen(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-[var(--color-muted)] transition-colors"
          >
            <PriorityIcon value={opt.value} />
            <span>{opt.label}</span>
            {value === opt.value && <Check className="ml-auto h-3 w-3 text-[var(--primary)]" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Users Cell (multi-select)
// ---------------------------------------------------------------------------
function UsersCell({ projectUsers, allUsers, onSave }: { projectUsers: ProjectUser[]; allUsers: UserRecord[]; onSave: (userIds: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const currentIds = useMemo(() => new Set(projectUsers.map(u => u.id)), [projectUsers]);

  const toggle = (user: UserRecord) => {
    const newIds = new Set(currentIds);
    if (newIds.has(user.id)) newIds.delete(user.id);
    else newIds.add(user.id);
    onSave(Array.from(newIds));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 cursor-pointer outline-none">
        {projectUsers.length > 0 ? (
          <div className="flex -space-x-1">
            {projectUsers.slice(0, 4).map((u) => <AvatarCustom key={u.id} name={u.name} avatarBase64={u.avatarBase64} />)}
            {projectUsers.length > 4 && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[9px] font-bold text-[var(--color-muted-foreground)] border border-[var(--color-border)]">
                +{projectUsers.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-[var(--color-muted-foreground)] italic border border-dashed border-[var(--color-border)] rounded-full px-2 py-0.5">
            + Assigner
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Chercher un utilisateur..." />
          <CommandList>
            <CommandEmpty>Aucun utilisateur.</CommandEmpty>
            <CommandGroup>
              {allUsers.map((user) => (
                <CommandItem key={user.id} onSelect={() => toggle(user)}>
                  <div className="flex items-center gap-2 flex-1">
                    <AvatarCustom name={user.name} avatarBase64={user.avatarBase64} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase">{user.role}</p>
                    </div>
                  </div>
                  {currentIds.has(user.id) && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Main Table
// ---------------------------------------------------------------------------

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

import { cn } from "@/lib/utils";

export function ProjectsTable({ projects: serverProjects, allUsers, currentUserId }: { projects: ProjectRow[]; allUsers: UserRecord[]; currentUserId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [settingsProject, setSettingsProject] = useState<ProjectRow | null>(null);

  // === OPTIMISTIC STATE ===
  const [localProjects, setLocalProjects] = useState(serverProjects);

  // Resync when server data changes (after revalidation: add/delete/duplicate)
  useEffect(() => {
    setLocalProjects(serverProjects);
  }, [serverProjects.length]);

  // Filter out admins from the users dropdown (admins have implicit access)
  const nonAdminUsers = useMemo(() => allUsers.filter(u => u.role !== "admin"), [allUsers]);

  // --- Optimistic update helpers ---
  const optimisticUpdate = (projectId: string, patch: Partial<ProjectRow>) => {
    setLocalProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...patch } : p));
  };

  const handleUpdateField = (projectId: string, field: string, value: any) => {
    const previous = localProjects;
    optimisticUpdate(projectId, { [field]: value } as any);

    startTransition(async () => {
      const res = await updateProjectAction(projectId, { [field]: value });
      if (res?.error) {
        setLocalProjects(previous);
        toast.error(res.error);
      } else {
        toast.success("Sauvegardé");
      }
    });
  };

  const handleUpdateUsers = (projectId: string, userIds: string[]) => {
    const previous = localProjects;
    // Build optimistic users list from allUsers
    const newUsers = userIds.map(id => {
      const u = allUsers.find(u => u.id === id);
      return u ? { id: u.id, name: u.name, avatarBase64: u.avatarBase64, role: "member" } : null;
    }).filter(Boolean) as ProjectUser[];
    optimisticUpdate(projectId, { users: newUsers });

    startTransition(async () => {
      const res = await updateProjectUsersAction(projectId, userIds);
      if (res?.error) {
        setLocalProjects(previous);
        toast.error(res.error);
      } else {
        toast.success("Utilisateurs mis à jour");
      }
    });
  };

  const handleUploadLogo = (projectId: string, base64: string) => {
    const previous = localProjects;
    optimisticUpdate(projectId, { logoBase64: base64 });

    startTransition(async () => {
      const res = await updateProjectLogoAction(projectId, base64);
      if (res?.error) {
        setLocalProjects(previous);
        toast.error(res.error);
      } else {
        toast.success("Logo mis à jour");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce projet ?")) {
      await deleteProjectAction(id);
      setSettingsProject(null);
      toast.success("Projet supprimé");
    }
  };

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = useMemo(() => {
    if (!sortConfig) return localProjects;
    return [...localProjects].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case "name":
          valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case "users":
          valA = a.users[0]?.name ?? ""; valB = b.users[0]?.name ?? ""; break;
        case "priority":
          valA = a.priority ?? 0; valB = b.priority ?? 0; break;
        case "progress":
          valA = a.contentCounts.tasks > 0 ? a.contentCounts.tasksDone / a.contentCounts.tasks : 0;
          valB = b.contentCounts.tasks > 0 ? b.contentCounts.tasksDone / b.contentCounts.tasks : 0;
          break;
        default:
          valA = 0; valB = 0;
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [localProjects, sortConfig]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col">
      <table className="text-sm border-collapse w-full relative">
        <thead className="bg-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 text-left w-16 whitespace-nowrap border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Logo</span>
            </th>
            <SortableHeader label="Projet" sortKey="name" sortConfig={sortConfig} onSort={requestSort} className="w-auto whitespace-nowrap" />
            <th className="px-4 py-3 text-left w-full max-w-0 border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Lien (URL)</span>
            </th>
            <SortableHeader label="Utilisateurs" sortKey="users" sortConfig={sortConfig} onSort={requestSort} className="w-36" />
            <SortableHeader label="Priorité" sortKey="priority" sortConfig={sortConfig} onSort={requestSort} align="center" className="w-20" />
            <SortableHeader label="Avancement" sortKey="progress" sortConfig={sortConfig} onSort={requestSort} align="center" className="w-28" />
            <th className="px-2 py-3 text-center w-12 border-b border-[var(--color-border)]"></th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => {
            const isMyRecord = currentUserId ? project.users.some(u => u.id === currentUserId) : false;
            return (
              <tr key={project.id} className={cn(
                "border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)] transition-colors group",
                isMyRecord && "bg-primary/5"
              )}>
                {/* Logo */}
              <td className="px-4 py-2">
                <ImageUpload
                  currentImage={project.logoBase64}
                  onUpload={async (base64) => { handleUploadLogo(project.id, base64); }}
                  shape="square"
                  compact
                  fallbackLabel={project.name}
                />
              </td>

              {/* Projet name (editable) */}
              <td className="px-4 py-2">
                <EditableTextCell
                  value={project.name}
                  onSave={(v) => handleUpdateField(project.id, "name", v)}
                  placeholder="Nom du projet"
                  className="font-medium text-[var(--color-foreground)]"
                />
              </td>

              {/* URL (editable) */}
              <td className="px-4 py-2">
                <UrlCell
                  value={project.url}
                  onSave={(url) => handleUpdateField(project.id, "url", url)}
                />
              </td>

              {/* Users (multi-select) — admins excluded */}
              <td className="px-4 py-2">
                <UsersCell
                  projectUsers={project.users}
                  allUsers={nonAdminUsers}
                  onSave={(userIds) => handleUpdateUsers(project.id, userIds)}
                />
              </td>

              {/* Priority */}
              <td className="px-4 py-2">
                <div className="flex justify-center">
                  <PriorityCell
                    value={project.priority ?? 0}
                    onSave={(v) => handleUpdateField(project.id, "priority", v)}
                  />
                </div>
              </td>

              {/* Avancement */}
              <td className="px-4 py-2">
                {(() => {
                  const total = project.contentCounts.tasks;
                  const done = project.contentCounts.tasksDone;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div className="flex items-center gap-2" title={`${done}/${total} tâches terminées`}>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-muted)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct === 100 ? '#10B981' : pct >= 50 ? '#3B82F6' : pct > 0 ? '#F59E0B' : 'transparent',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--color-muted-foreground)] w-8 text-right">{pct}%</span>
                    </div>
                  );
                })()}
              </td>

              {/* Actions */}
              <td className="px-2 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors outline-none mx-auto cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSettingsProject(project); }} className="cursor-pointer">
                      <PenLine className="h-4 w-4 mr-2" />
                      Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/client/${project.slug}-${project.clientPortalToken}`, '_blank'); }} className="cursor-pointer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Vue Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          )})}
        </tbody>
      </table>

      {/* Slide-over Settings */}
      <Sheet open={!!settingsProject} onOpenChange={(val: boolean) => !val && setSettingsProject(null)}>
        <SheetContent className="w-[75%] sm:w-[75%] sm:max-w-[720px] !max-w-[720px] overflow-y-auto overflow-x-hidden px-8 py-8" side="right">
          <SheetHeader className="sr-only">
            <SheetTitle>Configuration : {settingsProject?.name}</SheetTitle>
            <SheetDescription>Gérez l'accès au portail client et les personnalisations.</SheetDescription>
          </SheetHeader>
          
          {settingsProject && (
            <div className="flex flex-col gap-6 pb-12">
               <PortalSettingsForm project={settingsProject as any} />
               
               <div className="pt-8 mt-4 border-t border-[var(--color-border)]">
                 <h3 className="text-sm font-semibold text-red-500 mb-2">Zone Dangereuse</h3>
                 <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
                   La suppression du projet supprimera définitivement toutes les tâches, commentaires, documents et fichiers qui lui sont liés. Cette action est irréversible.
                 </p>
                 <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(settingsProject.id)}>
                   <Trash2 size={16} />
                   Supprimer ce projet
                 </Button>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
