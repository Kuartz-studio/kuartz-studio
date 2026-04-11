"use client";

import { useState, useMemo, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Filter, Check, X, CalendarIcon, Plus, Trash2, FolderKanban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatusIcon, PriorityIcon, AvatarCustom } from "@/components/ui/table-icons";
import { updateTaskAction, updateTaskAssigneesAction, updateTaskStatusAction } from "@/actions/tasks";
import { createTagAction, deleteTagAction, updateTagColorAction, updateTaskTagsAction } from "@/actions/tags";
import { ProjectTag } from "@/components/projects/ProjectTag";

// Types
export interface DbTag { id: string; name: string; color: string | null; projectId: string | null; }
export interface TaskTag { tag: DbTag; }
export interface UserRecord { id: string; name: string; email: string; avatarBase64: string | null; role: string; }
export interface TaskAssignee { user: UserRecord; }
export interface EnrichedTask {
  id: string; issueNumber: number | null; title: string; description: string | null;
  status: string; priority: number; targetDate: string | null;
  projectId: string; projectName: string; projectSlug: string; projectLogoBase64: string | null;
  assignees: TaskAssignee[];
  tags: TaskTag[];
}
interface ProjectRecord { id: string; name: string; slug: string; logoBase64: string | null; }

// Constants
const STATUS_OPTIONS = [
  { value: "BACKLOG", label: "Backlog", color: "#6B7280" },
  { value: "TODO", label: "À faire", color: "#94A3B8" },
  { value: "IN_PROGRESS", label: "En cours", color: "#3B82F6" },
  { value: "IN_REVIEW", label: "En revue", color: "#F59E0B" },
  { value: "PAUSED", label: "Pause", color: "#A855F7" },
  { value: "DONE", label: "Terminé", color: "#10B981" },
  { value: "CANCELED", label: "Annulé", color: "#EF4444" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "Aucune", color: "#6B7280" },
  { value: 1, label: "Basse", color: "#94A3B8" },
  { value: 2, label: "Moyenne", color: "#3B82F6" },
  { value: 3, label: "Haute", color: "#F59E0B" },
  { value: 4, label: "Urgente", color: "#EF4444" },
];

const TAG_PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#78716C", "#6B7280", "#64748B",
];

const DEFAULT_STATUS = { value: "BACKLOG", label: "Backlog", color: "#A8A29E" } as const;
const DEFAULT_PRIORITY = { value: 0, label: "Aucune", color: "#A8A29E" } as const;
function getStatus(v: string) { return STATUS_OPTIONS.find((s) => s.value === v) ?? DEFAULT_STATUS; }
function getPriority(v: number) { return PRIORITY_OPTIONS.find((p) => p.value === v) ?? DEFAULT_PRIORITY; }

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------
function EditableTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onSave(draft.trim());
    else setDraft(value);
  };

  if (!editing) {
    return (
      <span
        className="block text-[13px] text-[var(--color-foreground)] truncate cursor-text hover:underline hover:decoration-dashed hover:decoration-[var(--color-muted-foreground)] underline-offset-2"
        title={value}
        onClick={(e) => { e.stopPropagation(); setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
    );
  }

  return (
    <Input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
      onClick={(e) => e.stopPropagation()}
      className="h-7 text-[13px] border-[var(--primary)] focus-visible:ring-[var(--primary)]"
    />
  );
}

function StatusCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const status = getStatus(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center justify-center p-1.5 text-[11px] font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors rounded hover:bg-[var(--color-muted)]" title={status.label} onClick={(e) => e.stopPropagation()}>
        <StatusIcon value={value} />
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandList>
            <CommandGroup>
              {STATUS_OPTIONS.map((s) => (
                <CommandItem key={s.value} onSelect={() => { onSave(s.value); setOpen(false); }} className="gap-2">
                  <StatusIcon value={s.value} />
                  <span className="text-xs" style={{ color: s.color }}>{s.label}</span>
                  {s.value === value && <Check className="ml-auto h-3.5 w-3.5" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PriorityCell({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  const prio = getPriority(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center justify-center p-1.5 text-[11px] font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors rounded hover:bg-[var(--color-muted)]" title={prio.label} onClick={(e) => e.stopPropagation()}>
        <PriorityIcon value={value} />
      </PopoverTrigger>
      <PopoverContent className="w-[170px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandList>
            <CommandGroup>
              {PRIORITY_OPTIONS.map((p) => (
                <CommandItem key={p.value} onSelect={() => { onSave(p.value); setOpen(false); }} className="gap-2">
                  <PriorityIcon value={p.value} />
                  <span className="text-xs" style={{ color: p.color }}>{p.label}</span>
                  {p.value === value && <Check className="ml-auto h-3.5 w-3.5" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DateCell({ value, status, onSave }: { value: string | null; status?: string; onSave: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;

  let textClass = "text-[var(--color-foreground)] opacity-50";
  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    
    if (status === "DONE") {
      textClass = "text-[var(--color-foreground)] opacity-50";
    } else if (dateCopy < today) {
      textClass = "text-red-500 font-medium";
    } else {
      textClass = "text-[var(--color-foreground)] opacity-100";
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn("flex items-center gap-1.5 text-[12px] transition-colors group hover:opacity-80 outline-none cursor-pointer", textClass)} onClick={(e) => e.stopPropagation()}>
        <CalendarIcon className="h-3 w-3 opacity-60 group-hover:opacity-100" />
        {date ? format(date, "d MMM yyyy", { locale: fr }) : <span className="italic">Choisir...</span>}
      </PopoverTrigger>
      <PopoverContent className="w-[225px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Calendar
          className="w-full"
          mode="single"
          selected={date}
          onSelect={(d) => { setOpen(false); onSave(d ? d.toISOString() : null); }}
          initialFocus
        />
        {date && (
          <div className="p-2 border-t border-[var(--color-border)]">
            <button onClick={() => { onSave(null); setOpen(false); }}
              className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 justify-center w-full py-1">
              <X className="h-3 w-3" /> Supprimer la date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ColorPaletteGrid({ currentColor, usedColors, onSelect }: {
  currentColor: string; usedColors: Set<string>; onSelect: (c: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 p-2">
      {TAG_PRESET_COLORS.map((c) => {
        const isCurrent = c.toLowerCase() === currentColor.toLowerCase();
        const isUsed = !isCurrent && usedColors.has(c.toLowerCase());
        return (
          <button
            key={c}
            disabled={isUsed}
            onClick={(e) => { e.stopPropagation(); if (!isUsed) onSelect(c); }}
            className={cn(
              "relative h-5 w-5 rounded-full border transition-all outline-none shrink-0",
              isCurrent ? "ring-2 ring-offset-1 ring-[var(--primary)] border-transparent" : "border-black/15 dark:border-white/15",
              isUsed ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110",
            )}
            style={{ backgroundColor: c }}
            title={isUsed ? "Déjà utilisée" : c}
          >
            {isUsed && <X className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow-sm" />}
            {isCurrent && <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow-sm" />}
          </button>
        );
      })}
    </div>
  );
}

function TagsCell({ tags, allTags, onChange, onCreateTag, onDeleteTag, onUpdateTagColor }: {
  tags: TaskTag[]; allTags: DbTag[];
  onChange: (tags: TaskTag[]) => void;
  onCreateTag: (name: string, color: string) => Promise<DbTag | null>;
  onDeleteTag: (tagId: string) => void;
  onUpdateTagColor: (tagId: string, color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [colorPickerTagId, setColorPickerTagId] = useState<string | null>(null);
  
  const currentIds = useMemo(() => new Set(tags.map((t) => t.tag.id)), [tags]);

  const usedColors = useMemo(() => {
    const set = new Set<string>();
    allTags.forEach(t => { if (t.color) set.add(t.color.toLowerCase()); });
    return set;
  }, [allTags]);

  const toggle = (tag: DbTag) => {
    let newTags = [...tags];
    if (currentIds.has(tag.id)) newTags = newTags.filter(t => t.tag.id !== tag.id);
    else newTags.push({ tag });
    onChange(newTags);
  };

  const exactMatch = allTags.some(t => t.name.toLowerCase() === search.toLowerCase());

  const handleCreate = async () => {
    if (!search.trim() || exactMatch || isCreating) return;
    setIsCreating(true);
    const color = TAG_PRESET_COLORS.find(c => !usedColors.has(c.toLowerCase())) ?? "#EF4444";
    const newTag = await onCreateTag(search.trim(), color);
    setIsCreating(false);
    if (newTag) {
      onChange([...tags, { tag: newTag }]);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setColorPickerTagId(null); }}>
      <PopoverTrigger className="flex flex-wrap items-center gap-1 min-w-[80px] cursor-pointer outline-none" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        {tags.map((t) => {
            const bg = t.tag.color ? `${t.tag.color}22` : "#8888ff22";
            const text = t.tag.color ?? "#8888ff";
            return (
              <span key={t.tag.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border whitespace-nowrap transition-colors"
                style={{ backgroundColor: bg, color: text, borderColor: t.tag.color ? `${t.tag.color}44` : "#8888ff44" }}>
                {t.tag.name}
              </span>
            );
          })}
          {tags.length === 0 && (
            <span className="text-[10px] text-[var(--color-muted-foreground)] italic border border-dashed border-[var(--color-border)] rounded-full px-2 py-0.5">
              + Tag
            </span>
          )}
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Command>
          <div className="relative">
            <CommandInput placeholder="Chercher ou créer..." value={search} onValueChange={setSearch}
              onKeyDown={(e) => { if (e.key === "Enter" && search.trim() && !exactMatch) { e.preventDefault(); handleCreate(); } }} />
            {search.trim() && !exactMatch && !isCreating && (
              <button onClick={handleCreate} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded bg-[var(--primary)] text-[var(--primary-foreground)]">
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
            {isCreating && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />}
          </div>
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm">Aucun tag trouvé.</CommandEmpty>
            <CommandGroup>
              {allTags.map((tag) => {
                const bg = tag.color ? `${tag.color}22` : "#8888ff22";
                const text = tag.color ?? "#8888ff";
                return (
                  <div key={tag.id}>
                    <CommandItem onSelect={() => { if (colorPickerTagId !== tag.id) toggle(tag); }} className="group/item flex items-center gap-2 pr-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors" style={{ backgroundColor: bg, color: text }}>
                        {tag.name}
                      </span>
                      <div className="ml-auto flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setColorPickerTagId(colorPickerTagId === tag.id ? null : tag.id); }}
                          className="relative h-4 w-4 rounded-full border border-black/20 dark:border-white/20 shrink-0 cursor-pointer hover:scale-110"
                          style={{ backgroundColor: text }} title="Changer couleur"
                        />
                        <button onClick={(e) => { e.stopPropagation(); onDeleteTag(tag.id); }} className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {currentIds.has(tag.id) && <Check className="ml-1 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
                    </CommandItem>
                    {colorPickerTagId === tag.id && (
                      <div className="border-t border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                        <ColorPaletteGrid currentColor={tag.color || "#8888ff"} usedColors={usedColors} onSelect={(c) => { onUpdateTagColor(tag.id, c); setColorPickerTagId(null); }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AssigneeCell({ assignees, allUsers, onSave }: { assignees: TaskAssignee[]; allUsers: UserRecord[]; onSave: (userIds: string[]) => void; }) {
  const [open, setOpen] = useState(false);
  const currentIds = useMemo(() => new Set(assignees.map((a) => a.user.id)), [assignees]);

  const toggle = (user: UserRecord) => {
    const newIds = new Set(currentIds);
    if (newIds.has(user.id)) newIds.delete(user.id);
    else newIds.add(user.id);
    onSave(Array.from(newIds));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 cursor-pointer group outline-none" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        {assignees.length > 0 ? (
            <>
              <div className="flex -space-x-1">
                {assignees.slice(0, 3).map((a) => <AvatarCustom key={a.user.id} name={a.user.name} avatarBase64={a.user.avatarBase64} />)}
                {assignees.length > 3 && <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[9px] font-bold text-[var(--color-muted-foreground)] border border-[var(--color-border)]">+{assignees.length - 3}</span>}
              </div>
              {assignees.length === 1 && assignees[0] && (
                <span className="text-xs text-[var(--color-muted-foreground)] truncate max-w-[80px]">
                  {assignees[0].user.name}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-[var(--color-muted-foreground)] italic border border-dashed border-[var(--color-border)] rounded-full px-2 py-0.5">
              + Assigner
            </span>
          )}
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
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
// Main
// ---------------------------------------------------------------------------

export function TasksTable({ 
  tasks,
  allTags,
  allUsers,
  allProjects,
  projectUserMap,
}: { 
  tasks: EnrichedTask[]; 
  allTags: DbTag[];
  allUsers: UserRecord[];
  allProjects: ProjectRecord[];
  /** Map of projectId → userId[] for project membership filtering */
  projectUserMap: Record<string, string[]>;
}) {
  const [isPending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-xl border flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Check className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Aucune tâche trouvée.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[1%]">ID</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[15%]">Projet</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-auto">Titre</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[1%]">Tags</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[1%] whitespace-nowrap">Statut</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[120px]">Priorité</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[150px]">Échéance</th>
              <th className="px-4 py-3 text-left bg-[var(--color-muted)] border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase w-[160px]">Assigné</th>
            </tr>
          </thead>
          <tbody className={cn("transition-opacity", isPending && "opacity-70")}>
            {tasks.map((task) => (
              <tr key={task.id} className="group border-b last:border-0 border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors">
                
                {/* ID */}
                <td className="px-4 py-2.5">
                  <span className="text-[12px] font-mono text-[var(--color-muted-foreground)] select-none">
                    #{task.issueNumber}
                  </span>
                </td>

                {/* Projet */}
                <td className="px-4 py-2.5">
                  <ProjectTag name={task.projectName} logoBase64={task.projectLogoBase64} />
                </td>

                {/* Titre */}
                <td className="px-4 py-2.5">
                  <EditableTitle 
                    value={task.title} 
                    onSave={(v) => startTransition(() => { updateTaskAction(task.id, { title: v }) })} 
                  />
                </td>

                {/* Tags */}
                <td className="px-4 py-2.5">
                  <TagsCell 
                    tags={task.tags} 
                    allTags={allTags} 
                    onChange={(newTags) => startTransition(() => { updateTaskTagsAction(task.id, newTags.map(t => t.tag.id)) })}
                    onCreateTag={async (name, color) => {
                      const newTag = await createTagAction(name, color);
                      return newTag ?? null;
                    }}
                    onDeleteTag={(tagId) => startTransition(() => { deleteTagAction(tagId) })}
                    onUpdateTagColor={(tagId, color) => startTransition(() => { updateTagColorAction(tagId, color) })}
                  />
                </td>

                {/* Statut */}
                <td className="px-4 py-2.5">
                  <StatusCell value={task.status} onSave={(v) => startTransition(() => { updateTaskStatusAction(task.id, v as "BACKLOG" | "TODO" | "IN_PROGRESS" | "PAUSED" | "DONE" | "CANCELED") })} />
                </td>

                {/* Priorité */}
                <td className="px-4 py-2.5">
                  <PriorityCell value={task.priority} onSave={(v) => startTransition(() => { updateTaskAction(task.id, { priority: v }) })} />
                </td>

                {/* Echéance */}
                <td className="px-4 py-2.5">
                  <DateCell 
                    value={task.targetDate} 
                    status={task.status} 
                    onSave={(v) => startTransition(() => { updateTaskAction(task.id, { targetDate: v ? new Date(v) : null }) })} 
                  />
                </td>

                {/* Assigné */}
                <td className="px-4 py-2.5">
                  <AssigneeCell 
                    assignees={task.assignees} 
                    allUsers={projectUserMap ? allUsers.filter(u => (projectUserMap[task.projectId] ?? []).includes(u.id)) : allUsers} 
                    onSave={(userIds) => startTransition(() => { updateTaskAssigneesAction(task.id, userIds) })} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
