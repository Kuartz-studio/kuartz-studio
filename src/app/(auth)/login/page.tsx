"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, {});

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Kuartz Studio</CardTitle>
          <CardDescription>
            Connectez-vous à votre espace. (Clients: Entrez votre email uniquement)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
            {state.error && (
              <div className="text-sm font-medium text-destructive">{state.error}</div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Adresse Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                required
              />
              {state.fieldErrors?.email && (
                <span className="text-xs text-destructive">{state.fieldErrors.email[0]}</span>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="pin">Digicode (Équipe Kuartz uniquement)</Label>
              </div>
              <Input 
                id="pin" 
                name="pin" 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
              />
              {state.fieldErrors?.pin && (
                <span className="text-xs text-destructive">{state.fieldErrors.pin[0]}</span>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
