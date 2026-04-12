"use client";

import { useActionState, useState, useMemo, useRef } from "react";
import { createProjectWithPresetAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { compressImage } from "@/lib/image";
import Link from "next/link";
import { ArrowLeft, ListChecks, Check, ImagePlus, Loader2, Link2 } from "lucide-react";
import { AvatarCustom } from "@/components/ui/table-icons";

type User = { id: string; name: string; role: string; avatarBase64: string | null };

const PRESET_TASKS = [
  { title: "Discovery call", tag: "commercial", assignee: "anas", status: "Todo" },
  { title: "Sending contract", tag: "commercial", assignee: "anas", status: "Todo" },
  { title: "Client onboarding doc", tag: "commercial", assignee: "anas", status: "Todo" },
  { title: "Design moodboard", tag: "design", assignee: "mehdi", status: "Todo" },
  { title: "Brand identity", tag: "design", assignee: "mehdi", status: "Todo" },
  { title: "Wireframes", tag: "design", assignee: "mehdi", status: "Todo" },
  { title: "Website design", tag: "design", assignee: "mehdi", status: "Todo" },
  { title: "Copywriting", tag: "content", assignee: "anas", status: "Todo" },
  { title: "Framer setup", tag: "integration", assignee: "Andréa", status: "Todo" },
  { title: "Static integration", tag: "integration", assignee: "Andréa", status: "Todo" },
  { title: "CMS setup", tag: "integration", assignee: "Andréa", status: "Todo" },
  { title: "Animation integration", tag: "integration", assignee: "Andréa", status: "Todo" },
  { title: "Visual testing", tag: "qa", assignee: "Andréa", status: "Todo" },
  { title: "SEO check", tag: "qa", assignee: "Andréa", status: "Todo" },
  { title: "Responsive & perf check", tag: "qa", assignee: "Andréa", status: "Todo" },
  { title: "Client review round 1", tag: "qa", assignee: "anas", status: "Todo" },
  { title: "Fix round 1", tag: "qa", assignee: "Andréa", status: "Todo" },
  { title: "Prepare deliverables", tag: "integration", assignee: "anas", status: "Todo" },
  { title: "Framer unboarding", tag: "commercial", assignee: "Andréa", status: "Todo" },
  { title: "Client marketing automation", tag: "growth", assignee: "anas", status: "Todo" },
];

const TAG_COLORS: Record<string, string> = {
  commercial: "#F59E0B",
  design: "#8B5CF6",
  content: "#EC4899",
  integration: "#205CFF",
  qa: "#10B981",
  growth: "#06B6D4",
};

// ---------------------------------------------------------------------------
// PresetAssigneeCell
// ---------------------------------------------------------------------------
function PresetAssigneeCell({
  assigneeIds,
  allUsers,
  onSave,
  disabled,
}: {
  assigneeIds: string[];
  allUsers: User[];
  onSave: (userIds: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const currentIds = new Set(assigneeIds);
  const assignedUsers = allUsers.filter(u => currentIds.has(u.id));

  const toggle = (user: User) => {
    const newIds = new Set(currentIds);
    if (newIds.has(user.id)) newIds.delete(user.id);
    else newIds.add(user.id);
    onSave(Array.from(newIds));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className="flex items-center gap-1 cursor-pointer group outline-none"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        {assignedUsers.length > 0 ? (
          <>
            <div className="flex -space-x-1">
              {assignedUsers.slice(0, 3).map((u) => (
                <AvatarCustom key={u.id} name={u.name} avatarBase64={u.avatarBase64} />
              ))}
              {assignedUsers.length > 3 && (
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[9px] font-bold text-[var(--color-muted-foreground)] border border-[var(--color-border)]">
                  +{assignedUsers.length - 3}
                </span>
              )}
            </div>
            {assignedUsers.length === 1 && assignedUsers[0] && (
              <span className="text-xs text-[var(--color-muted-foreground)] truncate max-w-[80px]">
                {assignedUsers[0].name}
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
                  {currentIds.has(user.id) && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />}
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
// NewProjectForm
// ---------------------------------------------------------------------------
export function NewProjectForm({ users }: { users: User[] }) {
  const [state, action, isPending] = useActionState(createProjectWithPresetAction, {});
  const [presetEnabled, setPresetEnabled] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<boolean[]>(PRESET_TASKS.map(() => true));

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Project members (admins are always included implicitly)
  const [projectMembers, setProjectMembers] = useState<string[]>([]);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);

  // Visible users for preset tasks = admins + project members
  const visibleUsersForPreset = useMemo(() => {
    return users.filter(u => u.role === "admin" || projectMembers.includes(u.id));
  }, [users, projectMembers]);

  // Resolve preset assignee names to user IDs (only if user is visible)
  const resolveUserId = (name: string): string[] => {
    const user = visibleUsersForPreset.find(u => u.name.toLowerCase() === name.toLowerCase());
    return user ? [user.id] : [];
  };

  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[][]>(
    PRESET_TASKS.map(t => resolveUserId(t.assignee))
  );

  // When project members change, re-resolve assignees and clean up invalid ones
  const handleMembersChange = (newMembers: string[]) => {
    setProjectMembers(newMembers);
    const validIds = new Set([...newMembers, ...users.filter(u => u.role === "admin").map(u => u.id)]);
    setTaskAssigneeIds(prev => prev.map(ids => ids.filter(id => validIds.has(id))));
  };

  const toggleTask = (index: number) => {
    setSelectedTasks(prev => prev.map((v, i) => i === index ? !v : v));
  };

  const toggleAll = () => {
    const allSelected = selectedTasks.every(Boolean);
    setSelectedTasks(prev => prev.map(() => !allSelected));
  };

  const updateAssignees = (index: number, userIds: string[]) => {
    setTaskAssigneeIds(prev => prev.map((v, i) => i === index ? userIds : v));
  };

  const selectedCount = selectedTasks.filter(Boolean).length;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setLogoLoading(true);
    try {
      const base64 = await compressImage(file);
      setLogoPreview(base64);
    } catch {
      // ignored
    } finally {
      setLogoLoading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Build JSON payload
  const presetTasksPayload = useMemo(() => {
    if (!presetEnabled) return "";
    const selected = PRESET_TASKS
      .map((t, i) => ({ ...t, assigneeIds: taskAssigneeIds[i] || [], included: selectedTasks[i] }))
      .filter(t => t.included);
    return JSON.stringify(selected.map(t => ({
      title: t.title,
      tag: t.tag,
      assigneeIds: t.assigneeIds,
      status: t.status,
    })));
  }, [presetEnabled, selectedTasks, taskAssigneeIds]);

  // Non-admin users for member selection
  const nonAdminUsers = users.filter(u => u.role !== "admin");
  const selectedMemberUsers = users.filter(u => projectMembers.includes(u.id));

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau projet</h1>
          <p className="text-muted-foreground mt-1">Créez un nouvel espace de travail pour un client.</p>
        </div>
      </div>

      <form action={action}>
        {/* Hidden fields */}
        {presetEnabled && <input type="hidden" name="presetTasks" value={presetTasksPayload} />}
        {logoPreview && <input type="hidden" name="logoBase64" value={logoPreview} />}
        {projectMembers.map(id => (
          <input key={id} type="hidden" name="memberIds" value={id} />
        ))}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ============================================================ */}
          {/* Project Details Card */}
          {/* ============================================================ */}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm lg:w-1/3 shrink-0 lg:sticky lg:top-8">
            <div className="p-6 flex flex-col gap-5">
              {state?.error && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {state.error}
                </div>
              )}

              {/* Row 1: Logo + Nom du projet */}
              <div className="flex items-center gap-3">
                {/* Logo upload */}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoLoading}
                  className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-foreground)]/40 transition-colors flex items-center justify-center bg-[var(--color-muted)] cursor-pointer relative group shrink-0"
                >
                  {logoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-muted-foreground)]" />
                  ) : logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImagePlus className="h-3.5 w-3.5 text-white" />
                      </div>
                    </>
                  ) : (
                    <ImagePlus className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                  )}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />

                <Input
                  id="name" name="name" required
                  placeholder="Nom du projet"
                  className="h-10 flex-1 text-sm font-medium"
                />
              </div>
              {state?.fieldErrors?.name && (
                <span className="text-xs text-destructive -mt-3">{state.fieldErrors.name[0]}</span>
              )}

              {/* Row 2: URL */}
              <div className="flex items-center gap-2 rounded-lg border border-input shadow-sm px-3 h-9 focus-within:ring-1 focus-within:ring-primary transition-colors">
                <Link2 size={14} className="text-muted-foreground shrink-0" />
                <input
                  id="url" name="url"
                  placeholder="ex : https://monsite.com"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground h-full"
                />
              </div>

              {/* Row 4: Description */}
              <Textarea
                id="description" name="description" rows={3}
                placeholder="Description (optionnelle)"
                className="min-h-[80px] px-4 py-3 resize-y text-sm"
              />

              {/* Row 3: Project Members */}
              <div className="flex items-center gap-2">
                <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
                  <PopoverTrigger
                    className="flex h-10 w-auto min-w-[40px] items-center justify-start rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors overflow-hidden hover:bg-muted shadow-sm"
                  >
                    {selectedMemberUsers.length > 0 ? (
                      <div className="flex items-center max-w-full">
                        <div className="flex -space-x-1 shrink-0">
                          {selectedMemberUsers.slice(0, 4).map(u => (
                            <AvatarCustom key={u.id} name={u.name} avatarBase64={u.avatarBase64} />
                          ))}
                          {selectedMemberUsers.length > 4 && (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[9px] font-bold border shrink-0 z-10">
                              +{selectedMemberUsers.length - 4}
                            </span>
                          )}
                        </div>
                        {selectedMemberUsers.length <= 2 && (
                          <span className="truncate flex-1 ml-2 text-foreground font-medium text-xs">
                            {selectedMemberUsers.map(u => u.name).join(", ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground whitespace-nowrap px-1">Membres du projet...</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ajouter un membre..." />
                      <CommandList>
                        <CommandEmpty>Aucun utilisateur.</CommandEmpty>
                        <CommandGroup>
                          {nonAdminUsers.map(u => {
                            const isSelected = projectMembers.includes(u.id);
                            return (
                              <CommandItem key={u.id} onSelect={() => {
                                const newMembers = isSelected
                                  ? projectMembers.filter(id => id !== u.id)
                                  : [...projectMembers, u.id];
                                handleMembersChange(newMembers);
                              }}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <AvatarCustom name={u.name} avatarBase64={u.avatarBase64} />
                                  <p className="text-sm font-medium truncate">{u.name}</p>
                                </div>
                                {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Preset Tasks */}
          {/* ============================================================ */}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex-1 lg:max-h-[calc(100vh-140px)] flex flex-col w-full min-h-[400px]">
            <div className="p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Preset de tâches</h3>
                  <p className="text-xs text-muted-foreground">Générer automatiquement un listing de tâches standard.</p>
                </div>
              </div>
              <Switch checked={presetEnabled} onCheckedChange={setPresetEnabled} />
            </div>

            {presetEnabled && (
              <div className="border-t border-[var(--color-border)] flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-muted)]">
                      <th className="px-3 py-2.5 text-left w-10 border-b border-[var(--color-border)]">
                        <input
                          type="checkbox"
                          checked={selectedTasks.every(Boolean)}
                          onChange={toggleAll}
                          className="rounded border-[var(--color-border)] accent-[var(--color-primary)] cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-left border-b border-[var(--color-border)] text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">
                        Tâche
                      </th>
                      <th className="px-3 py-2.5 text-left border-b border-[var(--color-border)] text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide w-28">
                        Tag
                      </th>
                      <th className="px-3 py-2.5 text-left border-b border-[var(--color-border)] text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide w-40">
                        Assignation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRESET_TASKS.map((task, index) => (
                      <tr
                        key={index}
                        className={`border-b last:border-0 border-[var(--color-border)] transition-colors ${
                          selectedTasks[index] ? "hover:bg-[var(--color-muted)]/50" : "opacity-40"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedTasks[index]}
                            onChange={() => toggleTask(index)}
                            className="rounded border-[var(--color-border)] accent-[var(--color-primary)] cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-[13px] font-medium">{task.title}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${TAG_COLORS[task.tag] || "#888"}20`,
                              color: TAG_COLORS[task.tag] || "#888",
                            }}
                          >
                            {task.tag}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <PresetAssigneeCell
                            assigneeIds={taskAssigneeIds[index] || []}
                            allUsers={visibleUsersForPreset}
                            onSave={(ids) => updateAssignees(index, ids)}
                            disabled={!selectedTasks[index]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {presetEnabled && (
              <div className="bg-[var(--color-muted)]/30 border-t border-[var(--color-border)] px-3 py-3 shrink-0">
                <span className="text-[11px] text-[var(--color-muted-foreground)]">
                  {selectedCount} / {PRESET_TASKS.length} tâches sélectionnées
                </span>
              </div>
            )}
            {!presetEnabled && (
              <div className="p-8 text-center text-muted-foreground bg-muted/20 flex-1 flex flex-col items-center justify-center">
                Aucun preset sélectionné. Le projet sera créé vide de tâches.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Actions */}
        {/* ============================================================ */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Link href="/projects">
            <Button variant="outline" type="button" disabled={isPending}>Annuler</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Création..." : presetEnabled ? `Créer le projet + ${selectedCount} tâches` : "Créer le projet"}
          </Button>
        </div>
      </form>
    </>
  );
}
