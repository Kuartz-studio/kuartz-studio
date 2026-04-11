"use client";

import { useActionState, useEffect, useState } from "react";
import { createTaskAction } from "@/actions/tasks";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Check, ChevronsUpDown, FolderKanban, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StatusIcon, PriorityIcon, AvatarCustom } from "@/components/ui/table-icons";

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
  { value: "0", label: "Aucune", color: "#6B7280" },
  { value: "1", label: "Basse", color: "#94A3B8" },
  { value: "2", label: "Moyenne", color: "#3B82F6" },
  { value: "3", label: "Haute", color: "#F59E0B" },
  { value: "4", label: "Urgente", color: "#EF4444" },
];

type Project = { id: string; name: string; slug: string; logoBase64?: string | null };
type UserMin = { id: string; name: string; email: string; avatarBase64: string | null; role: string };

export function NewTaskDialog({
  projectId,
  projects,
  users,
  projectUserMap,
}: {
  projectId?: string;
  projects?: Project[];
  users?: UserMin[];
  projectUserMap?: Record<string, string[]>;
}) {
  const [state, action, isPending] = useActionState(createTaskAction, {});
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState(2);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  
  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  
  const visibleUsers = users?.filter(u => {
    if (u.role === "admin") return true; // Admins always everywhere
    if (!selectedProjectId) return true; // Show all if no project (or you can show nothing, but wait.. tasks need projects to be created)
    return projectUserMap?.[selectedProjectId]?.includes(u.id);
  }) ?? [];

  useEffect(() => {
    if (state?.data?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={`${buttonVariants({ size: "sm" })} gap-1`}>
        <Plus size={16} /> Nouvelle Tâche
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={action} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Créer une tâche</DialogTitle>
            <DialogDescription>Ajoutez une nouvelle tâche{projectId ? " à ce projet" : ""}.</DialogDescription>
          </DialogHeader>

          {/* LIGNE 1: Projet et Échéance */}
          <div className="grid grid-cols-2 gap-4">
            {/* Projet */}
            {projectId ? (
              <input type="hidden" name="projectId" value={projectId} />
            ) : (
              <div className="flex flex-col gap-1.5">
                <input type="hidden" name="projectId" value={selectedProjectId} />
                <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                  <PopoverTrigger
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 h-10 text-sm transition-colors outline-none",
                      !selectedProjectId && "text-muted-foreground"
                    )}
                  >
                    {selectedProject ? (
                      <span className="flex items-center gap-2 truncate">
                        {selectedProject.logoBase64 ? (
                          <img src={selectedProject.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                        ) : (
                          <FolderKanban size={14} className="opacity-50 shrink-0" />
                        )}
                        <span className="truncate">{selectedProject.name}</span>
                      </span>
                    ) : (
                      <span>Sélectionner le projet...</span>
                    )}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Chercher un projet..." />
                      <CommandList>
                        <CommandEmpty>Aucun projet.</CommandEmpty>
                        <CommandGroup>
                          {projects?.map(p => (
                            <CommandItem
                              key={p.id}
                              value={p.name}
                              onSelect={() => { setSelectedProjectId(p.id); setProjectPopoverOpen(false); setSelectedAssignees([]); }}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                {p.logoBase64 ? (
                                  <img src={p.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                                ) : (
                                  <FolderKanban size={14} className="opacity-50 shrink-0" />
                                )}
                                <span className="text-sm">{p.name}</span>
                              </div>
                              {selectedProjectId === p.id && <Check className="ml-auto h-4 w-4 text-[var(--primary)]" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Date d'échéance */}
            <div className="flex flex-col gap-1.5">
              <input type="hidden" name="targetDate" value={targetDate ? targetDate.toISOString() : ""} />
              <Popover>
                <PopoverTrigger
                  disabled={!selectedProjectId}
                  className={cn(
                    "flex w-full items-center justify-start rounded-lg border border-input bg-transparent px-3 h-10 text-sm transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                  {targetDate ? format(targetDate, "d MMM yyyy", { locale: fr }) : <span className="truncate">Date d'échéance...</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(d) => setTargetDate(d)}
                    initialFocus
                  />
                  {targetDate && (
                    <div className="p-2 border-t border-[var(--color-border)]">
                      <button type="button" onClick={() => setTargetDate(undefined)} className="text-xs text-red-400 hover:text-red-500 w-full text-center py-1">Effacer la date</button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}

          {/* LIGNE 2: Titre et Description - Stacked Inputs */}
          <div className="flex flex-col w-full relative">
            <Input 
              id="title" name="title" required placeholder="Titre" 
              disabled={!selectedProjectId}
              className="relative z-10 border-input rounded-t-lg rounded-b-none shadow-sm focus-visible:ring-1 focus-visible:ring-primary px-4 py-3 h-12 text-sm font-medium focus-visible:z-20 disabled:opacity-50" 
            />
            {state?.fieldErrors?.title && (
              <span className="text-xs text-destructive px-4 py-1 relative z-20 bg-background">{state.fieldErrors.title[0]}</span>
            )}
            <Textarea 
              id="description" name="description" rows={3} placeholder="Description (optionnelle)" 
              disabled={!selectedProjectId}
              className="relative z-10 -mt-[1px] border-input rounded-t-none rounded-b-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary min-h-[90px] px-4 py-3 resize-y bg-transparent focus-visible:z-20 disabled:opacity-50 border-t-transparent focus-visible:border-t-input" 
            />
          </div>

          {/* LIGNE 3: Statut, Priorité, Assigné(s) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="hidden" name="status" value={status} />
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger 
                  disabled={!selectedProjectId}
                  className="inline-flex items-center justify-center p-1.5 h-10 w-10 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-input shadow-sm bg-transparent hover:bg-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  title={STATUS_OPTIONS.find(s => s.value === status)?.label}
                >
                  <StatusIcon value={status} />
                </PopoverTrigger>
                <PopoverContent className="w-[180px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {STATUS_OPTIONS.map((s) => (
                          <CommandItem key={s.value} onSelect={() => { setStatus(s.value); setStatusPopoverOpen(false); }} className="gap-2">
                            <StatusIcon value={s.value} />
                            <span className="text-xs" style={{ color: s.color }}>{s.label}</span>
                            {s.value === status && <Check className="ml-auto h-3.5 w-3.5" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <input type="hidden" name="priority" value={priority} />
              <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
                <PopoverTrigger 
                  disabled={!selectedProjectId}
                  className="inline-flex items-center justify-center p-1.5 h-10 w-10 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-input shadow-sm bg-transparent hover:bg-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  title={PRIORITY_OPTIONS.find(p => p.value === priority.toString())?.label}
                >
                  <PriorityIcon value={priority} />
                </PopoverTrigger>
                <PopoverContent className="w-[170px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {PRIORITY_OPTIONS.map((p) => (
                          <CommandItem key={p.value} onSelect={() => { setPriority(Number(p.value)); setPriorityPopoverOpen(false); }} className="gap-2">
                            <PriorityIcon value={Number(p.value)} />
                            <span className="text-xs" style={{ color: p.color }}>{p.label}</span>
                            {p.value === priority.toString() && <Check className="ml-auto h-3.5 w-3.5" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 flex-1">
              {selectedAssignees.map(id => (
                <input key={id} type="hidden" name="assignees" value={id} />
              ))}
              <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                <PopoverTrigger 
                  disabled={!selectedProjectId} 
                  className={cn(
                    "flex h-10 w-auto min-w-[40px] items-center justify-start rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted shadow-sm",
                    !selectedAssignees.length && "text-muted-foreground"
                  )}
                >
                  {selectedAssignees.length > 0 ? (
                    <div className="flex items-center max-w-full">
                      <div className="flex -space-x-1 shrink-0">
                        {selectedAssignees.slice(0, 3).map(id => {
                          const u = users?.find(user => user.id === id);
                          if (!u) return null;
                          return <div key={u.id} className="w-6 h-6 rounded-full overflow-hidden border bg-background shrink-0"><AvatarCustom name={u.name} avatarBase64={u.avatarBase64} /></div>;
                        })}
                        {selectedAssignees.length > 3 && (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-muted)] text-[9px] font-bold border shrink-0 z-10">
                            +{selectedAssignees.length - 3}
                          </span>
                        )}
                      </div>
                      {selectedAssignees.length === 1 && (
                          <span className="truncate flex-1 ml-2 text-foreground font-medium text-xs">{users?.find(u => u.id === selectedAssignees[0])?.name}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground whitespace-nowrap px-1">Assignation...</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Chercher un utilisateur..." />
                    <CommandList>
                      <CommandEmpty>Aucun utilisateur.</CommandEmpty>
                      <CommandGroup>
                        {visibleUsers.map(u => {
                          const isSelected = selectedAssignees.includes(u.id);
                          return (
                            <CommandItem key={u.id} onSelect={() => {
                              setSelectedAssignees(prev => isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id])
                            }}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <AvatarCustom name={u.name} avatarBase64={u.avatarBase64} />
                                <p className="text-sm font-medium truncate">{u.name}</p>
                              </div>
                              {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>Annuler</Button>
            <Button type="submit" disabled={isPending || (!projectId && !selectedProjectId)}>{isPending ? "Création..." : "Ajouter la tâche"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
