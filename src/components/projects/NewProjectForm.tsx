"use client";

import { useActionState, useState, useMemo } from "react";
import { createProjectWithPresetAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Link from "next/link";
import { ArrowLeft, ListChecks, Check } from "lucide-react";
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
  { title: "Framer setup", tag: "integration", assignee: "andrea", status: "Todo" },
  { title: "Static integration", tag: "integration", assignee: "andrea", status: "Todo" },
  { title: "CMS setup", tag: "integration", assignee: "andrea", status: "Todo" },
  { title: "Animation integration", tag: "integration", assignee: "andrea", status: "Todo" },
  { title: "Visual testing", tag: "qa", assignee: "andrea", status: "Todo" },
  { title: "SEO check", tag: "qa", assignee: "andrea", status: "Todo" },
  { title: "Responsive & perf check", tag: "qa", assignee: "andrea", status: "Todo" },
  { title: "Client review round 1", tag: "qa", assignee: "anas", status: "Todo" },
  { title: "Fix round 1", tag: "qa", assignee: "andrea", status: "Todo" },
  { title: "Prepare deliverables", tag: "integration", assignee: "anas", status: "Todo" },
  { title: "Framer unboarding", tag: "commercial", assignee: "andrea", status: "Todo" },
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
// PresetAssigneeCell — mirrors the TasksTable AssigneeCell pattern
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

  // Map preset assignee names to user IDs
  const resolveUserId = (name: string): string[] => {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    return user ? [user.id] : [];
  };

  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[][]>(
    PRESET_TASKS.map(t => resolveUserId(t.assignee))
  );

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

  // Build the JSON to send with form
  const presetTasksPayload = useMemo(() => {
    if (!presetEnabled) return "";
    const selected = PRESET_TASKS
      .map((t, i) => ({ ...t, assigneeIds: taskAssigneeIds[i] || [], included: selectedTasks[i] }))
      .filter(t => t.included);

    return JSON.stringify(
      selected.map(t => ({
        title: t.title,
        tag: t.tag,
        assigneeIds: t.assigneeIds,
        status: t.status,
      }))
    );
  }, [presetEnabled, selectedTasks, taskAssigneeIds]);

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
        {/* Hidden field for preset tasks JSON */}
        {presetEnabled && <input type="hidden" name="presetTasks" value={presetTasksPayload} />}

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du projet</CardTitle>
              <CardDescription>Remplissez les informations basiques pour initialiser le projet.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {state?.error && (
                  <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                    {state.error}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input id="name" name="name" placeholder="Ex: Refonte Site E-commerce" required />
                  {state?.fieldErrors?.name && (
                    <span className="text-xs text-destructive">{state.fieldErrors.name[0]}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" name="slug" placeholder="ex: refonte-ecommerce" className="font-mono text-sm" required />
                  <p className="text-xs text-muted-foreground">Ce slug sera utilisé dans l&apos;URL. Lettres minuscules, chiffres et tirets uniquement.</p>
                  {state?.fieldErrors?.slug && (
                    <span className="text-xs text-destructive">{state.fieldErrors.slug[0]}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Textarea id="description" name="description" placeholder="Courte description des objectifs..." rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preset Tasks Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ListChecks size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle>Preset de tâches</CardTitle>
                    <CardDescription>Générer automatiquement un listing de tâches standard.</CardDescription>
                  </div>
                </div>
                <Switch checked={presetEnabled} onCheckedChange={setPresetEnabled} />
              </div>
            </CardHeader>

            {presetEnabled && (
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
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
                              allUsers={users}
                              onSave={(ids) => updateAssignees(index, ids)}
                              disabled={!selectedTasks[index]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-[var(--color-muted)]/30 border-t border-[var(--color-border)] px-3 py-2">
                    <span className="text-[11px] text-[var(--color-muted-foreground)]">
                      {selectedCount} / {PRESET_TASKS.length} tâches sélectionnées
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/projects">
              <Button variant="outline" type="button" disabled={isPending}>Annuler</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création..." : presetEnabled ? `Créer le projet + ${selectedCount} tâches` : "Créer le projet"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
