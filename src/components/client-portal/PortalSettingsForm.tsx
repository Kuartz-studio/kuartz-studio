"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw, ExternalLink, Image as ImageIcon } from "lucide-react";
import { updatePortalSettingsAction, updatePortalSvgAction, regeneratePortalTokenAction } from "@/actions/projects";
import Link from "next/link";
import { toast } from "sonner"; // Assuming Sonner is used, if not we will just not alert or use alert.

type PortalSettings = {
  modules: {
    tasks: boolean;
    integration: boolean;
    branding: boolean;
  };
};

type Props = {
  project: {
    id: string;
    slug: string;
    clientPortalToken: string | null;
    iconSvg: string | null;
    portalSettings: PortalSettings | null;
  };
};

export function PortalSettingsForm({ project }: Props) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [svgCode, setSvgCode] = useState(project.iconSvg || "");
  
  const defaultSettings: PortalSettings = {
    modules: { tasks: true, integration: false, branding: false },
  };

  const currentSettings = project.portalSettings || defaultSettings;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const portalUrl = `${origin}/client/${project.slug}-${project.clientPortalToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Lien copié dans le presse-papiers");
  };

  const handleToggleModule = (moduleKey: keyof PortalSettings["modules"], checked: boolean) => {
    const newSettings = {
      ...currentSettings,
      modules: {
        ...currentSettings.modules,
        [moduleKey]: checked,
      },
    };
    startTransition(async () => {
      await updatePortalSettingsAction(project.id, newSettings);
      toast.success("Paramètres mis à jour");
    });
  };

  const handleSaveSvg = () => {
    startTransition(async () => {
      const res = await updatePortalSvgAction(project.id, svgCode);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Logo SVG mis à jour");
      }
    });
  };

  const handleRegenerateToken = () => {
    if (confirm("Attention: L'ancien lien cessera de fonctionner immédiatement. Continuer ?")) {
      startTransition(async () => {
        await regeneratePortalTokenAction(project.id);
        toast.success("Token regénéré");
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lien d'Accès Client</CardTitle>
            <CardDescription>
              Ce lien "sans mot de passe" donne accès au portail. Ne le partagez qu'aux clients du projet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md border text-sm overflow-x-auto whitespace-nowrap">
                {portalUrl}
              </code>
              <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copier">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
              <Link href={`/client/${project.slug}-${project.clientPortalToken}`} target="_blank">
                <Button variant="secondary" size="icon" title="Ouvrir">
                  <ExternalLink size={16} />
                </Button>
              </Link>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2 text-xs" 
                onClick={handleRegenerateToken}
                disabled={isPending}
              >
                <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
                Régénérer le lien secret
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modules du Portail</CardTitle>
            <CardDescription>Activez ou désactivez les fonctionnalités affichées sur le portail client.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label className="text-base">Tâches</Label>
                <p className="text-sm text-muted-foreground">Les clients peuvent voir et commenter les tâches.</p>
              </div>
              <Switch 
                checked={currentSettings.modules.tasks}
                disabled={isPending}
                onCheckedChange={(c: boolean) => handleToggleModule("tasks", c)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label className="text-base">Intégration & Docs</Label>
                <p className="text-sm text-muted-foreground">Affiche le menu de documentation sur-mesure.</p>
              </div>
              <Switch 
                checked={currentSettings.modules.integration}
                disabled={isPending}
                onCheckedChange={(c: boolean) => handleToggleModule("integration", c)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Marque & Design</CardTitle>
            <CardDescription>Personnalisez l'icône de la sidebar du projet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Code SVG de l'Icône</Label>
              <Textarea 
                value={svgCode}
                onChange={(e) => setSvgCode(e.target.value)}
                placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                className="font-mono text-xs h-32"
              />
              <p className="text-xs text-muted-foreground">
                Copiez-collez uniquement la balise <code>&lt;svg&gt;</code>. Il sera automatiquement colorisé en blanc sur le portail.
              </p>
            </div>
            <Button 
              onClick={handleSaveSvg} 
              disabled={isPending || svgCode === (project.iconSvg || "")}
              className="w-full gap-2"
            >
              <ImageIcon size={16} />
              Enregistrer le SVG
            </Button>

            {/* Aperçu */}
            {svgCode && svgCode.startsWith("<svg") && (
              <div className="mt-4 p-4 border rounded-lg bg-card/50 flex flex-col items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu rendu</span>
                <div 
                  className="w-12 h-12 flex items-center justify-center p-2 rounded-lg bg-[#1C1917] dark:bg-white text-white dark:text-black shadow-sm"
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
