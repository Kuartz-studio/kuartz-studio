"use client";

import { useState, useMemo, useTransition } from "react";
import { PenLine, Trash2, Check, ExternalLink, FolderKanban } from "lucide-react";
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
      className={`text-[13px] truncate block cursor-pointer hover:bg-[var(--color-muted)] px-1 -mx-1 py-0.5 rounded transition-colors ${className ?? ""}`}
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
export function ProjectsTable({ projects, allUsers }: { projects: ProjectRow[]; allUsers: UserRecord[] }) {
  const [isPending, startTransition] = useTransition();
  const [settingsProject, setSettingsProject] = useState<ProjectRow | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce projet ?")) {
      await deleteProjectAction(id);
      setSettingsProject(null);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col">
      <table className="text-sm border-collapse w-full relative table-fixed">
        <thead className="bg-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-3 text-left w-16 border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Logo</span>
            </th>
            <th className="px-4 py-3 text-left w-[25%] border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Projet</span>
            </th>
            <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Lien (URL)</span>
            </th>
            <th className="px-4 py-3 text-left w-[25%] border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Utilisateurs</span>
            </th>
            <th className="px-4 py-3 text-center w-20 border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Priorité</span>
            </th>
            <th className="px-4 py-3 text-center w-28 border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Avancement</span>
            </th>
            <th className="px-2 py-3 text-center w-24 border-b border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group">
              {/* Logo */}
              <td className="px-4 py-2">
                <ImageUpload
                  currentImage={project.logoBase64}
                  onUpload={async (base64) => { await updateProjectLogoAction(project.id, base64); }}
                  shape="square"
                  compact
                  fallbackLabel={project.name}
                />
              </td>

              {/* Projet name (editable) */}
              <td className="px-4 py-2">
                <EditableTextCell
                  value={project.name}
                  onSave={(v) => startTransition(() => { updateProjectAction(project.id, { name: v }) })}
                  placeholder="Nom du projet"
                  className="font-medium text-[var(--color-foreground)]"
                />
              </td>

              {/* URL (editable) */}
              <td className="px-4 py-2">
                <UrlCell
                  value={project.url}
                  onSave={(url) => startTransition(() => { updateProjectAction(project.id, { url }) })}
                />
              </td>

              {/* Users (multi-select) */}
              <td className="px-4 py-2">
                <UsersCell
                  projectUsers={project.users}
                  allUsers={allUsers}
                  onSave={(userIds) => startTransition(() => { updateProjectUsersAction(project.id, userIds) })}
                />
              </td>

              {/* Priority */}
              <td className="px-4 py-2">
                <div className="flex justify-center">
                  <PriorityCell
                    value={project.priority ?? 0}
                    onSave={(v) => startTransition(() => { updateProjectAction(project.id, { priority: v }) })}
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
                <div className="flex items-center justify-center gap-0.5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSettingsProject(project); }} 
                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors p-1.5 rounded-md" 
                    title="Configuration du projet"
                  >
                    <PenLine size={15} />
                  </button>
                  <Link href={`/client/${project.slug}-${project.clientPortalToken}`} target="_blank">
                    <button className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors p-1.5 rounded-md" title="Vue Client">
                      <ExternalLink size={15} />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
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
