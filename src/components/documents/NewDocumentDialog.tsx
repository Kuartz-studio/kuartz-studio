"use client";

import { useActionState, useEffect, useState } from "react";
import { createDocumentAction } from "@/actions/documents";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

export function NewDocumentDialog({ projectId }: { projectId: string }) {
  const [state, action, isPending] = useActionState(createDocumentAction, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.data?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={`${buttonVariants({ size: "sm", variant: "secondary" })} gap-1`}>
        <FileText size={16} /> Nouveau Document
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form action={action} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Créer un document</DialogTitle>
            <DialogDescription>Ajoutez une page de documentation markdown pour ce projet.</DialogDescription>
          </DialogHeader>

          <input type="hidden" name="projectId" value={projectId} />

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Titre du document</Label>
            <Input id="title" name="title" required placeholder="Ex: Onboarding Technique" />
            {state?.fieldErrors?.title && (
              <span className="text-xs text-destructive">{state.fieldErrors.title[0]}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Contenu (Markdown)</Label>
            <Textarea 
              id="content" 
              name="content" 
              rows={8} 
              placeholder={"# Mon document\n\nÉcrivez votre contenu en **Markdown** ici...\n\n- Point 1\n- Point 2"}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>Annuler</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Création..." : "Ajouter"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
