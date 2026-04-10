"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const [state, action, isPending] = useActionState(createProjectAction, {});

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
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

      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
          <CardDescription>Remplissez les informations basiques pour initialiser le projet.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
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
              <Textarea id="description" name="description" placeholder="Courte description des objectifs..." rows={4} />
              {state?.fieldErrors?.description && (
                <span className="text-xs text-destructive">{state.fieldErrors.description[0]}</span>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-2">
              <Link href="/projects">
                <Button variant="outline" type="button" disabled={isPending}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer le projet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
