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
import { Plus, Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = { id: string; name: string; slug: string; logoBase64?: string | null };

export function NewTaskDialog({ projectId, projects }: { projectId?: string; projects?: Project[] }) {
  const [state, action, isPending] = useActionState(createTaskAction, {});
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

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

          {/* Fixed project or selectable */}
          {projectId ? (
            <input type="hidden" name="projectId" value={projectId} />
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="projectId">Projet</Label>
              <input type="hidden" name="projectId" value={selectedProjectId} />
              <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                <PopoverTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none",
                    !selectedProjectId && "text-muted-foreground"
                  )}
                >
                    {selectedProject ? (
                      <span className="flex items-center gap-2">
                        {selectedProject.logoBase64 ? (
                          <img src={selectedProject.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                        ) : (
                          <FolderKanban size={14} className="opacity-50 shrink-0" />
                        )}
                        {selectedProject.name}
                      </span>
                    ) : (
                      <span>Sélectionner un projet</span>
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
                            onSelect={() => { setSelectedProjectId(p.id); setProjectPopoverOpen(false); }}
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

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" required placeholder="Ex: Corriger le bug d'affichage" />
            {state?.fieldErrors?.title && (
              <span className="text-xs text-destructive">{state.fieldErrors.title[0]}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Détails du problème..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select defaultValue="todo" name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="TODO">À faire</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="PAUSED">En pause</SelectItem>
                  <SelectItem value="DONE">Terminé</SelectItem>
                  <SelectItem value="CANCELED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select defaultValue="medium" name="priority">
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">N/A</SelectItem>
                  <SelectItem value="1">Basse</SelectItem>
                  <SelectItem value="2">Moyenne</SelectItem>
                  <SelectItem value="3">Haute</SelectItem>
                  <SelectItem value="4">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>Annuler</Button>
            <Button type="submit" disabled={isPending || (!projectId && !selectedProjectId)}>{isPending ? "Création..." : "Ajouter la tâche"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
