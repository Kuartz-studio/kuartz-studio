"use client";

import { useActionState, useEffect, useState } from "react";
import { createTaskAction } from "@/actions/tasks";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function NewTaskDialog({ projectId }: { projectId: string }) {
  const [state, action, isPending] = useActionState(createTaskAction, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.data?.success) {
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
            <DialogDescription>Ajoutez une nouvelle tâche à ce projet.</DialogDescription>
          </DialogHeader>

          <input type="hidden" name="projectId" value={projectId} />

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
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="review">En revue</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
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
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>Annuler</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Création..." : "Ajouter la tâche"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
