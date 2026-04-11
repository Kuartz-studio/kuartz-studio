"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw, ExternalLink, Image as ImageIcon, CheckSquare, FileText, Globe } from "lucide-react";
import { updatePortalSettingsAction, updatePortalSvgAction, regeneratePortalTokenAction } from "@/actions/projects";
import Link from "next/link";
import { toast } from "sonner"; // Assuming Sonner is used

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
        toast.success("Logo mis à jour");
      }
    });
  };

  const handleRegenerateToken = () => {
    if (confirm("Attention: L'ancien lien cessera de fonctionner immédiatement. Continuer ?")) {
      startTransition(async () => {
        await regeneratePortalTokenAction(project.id);
        toast.success("Lien secret régénéré avec succès");
      });
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* SECTION : LIEN SECRET */}
      <section className="flex flex-col gap-3">
        <header>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="text-[var(--primary)] shrink-0" size={18} />
            Accès Portail Client
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mt-1">
            Partagez ce lien sécurisé avec vos clients pour leur donner accès au portail.
          </p>
        </header>
        
        <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-muted/30 overflow-hidden mt-1 focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:border-[var(--primary)]/50 transition-all">
          <input 
            type="text" 
            readOnly 
            value={portalUrl}
            className="flex-1 px-4 py-2.5 text-sm bg-transparent text-[var(--color-foreground)] outline-none min-w-0 truncate cursor-text select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <div className="flex items-center border-l border-[var(--color-border)] shrink-0">
            <button
              onClick={copyToClipboard}
              className="px-3 py-2.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
              title="Copier le lien"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleRegenerateToken}
              disabled={isPending}
              className="px-3 py-2.5 text-[var(--color-muted-foreground)] hover:text-orange-500 hover:bg-orange-500/10 transition-colors border-l border-[var(--color-border)] disabled:opacity-50"
              title="Régénérer le lien secret"
            >
              <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
            </button>
            <Link href={`/client/${project.slug}-${project.clientPortalToken}`} target="_blank">
              <button
                className="px-3 py-2.5 text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors border-l border-[var(--color-border)]"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <hr className="border-[var(--color-border)]" />

      {/* SECTION : MODULES */}
      <section className="flex flex-col gap-4">
        <header>
          <h3 className="text-lg font-semibold">Modules Actifs</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mt-1">
            Personnalisez l'expérience client en activant ou masquant certains onglets dans son portail.
          </p>
        </header>

        <div className="border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] bg-card shadow-sm mt-2">
          
          <div className="flex p-4 hover:bg-[var(--color-muted)]/30 transition-colors">
            <div className="mr-4 mt-0.5 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CheckSquare size={16} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <Label className="text-base font-medium cursor-pointer">Module Tâches</Label>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                Le client pourra voir l'avancement, filtrer les tâches et valider/commenter le travail.
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <Switch 
                checked={currentSettings.modules.tasks}
                disabled={isPending}
                onCheckedChange={(c: boolean) => handleToggleModule("tasks", c)}
              />
            </div>
          </div>

          <div className="flex p-4 hover:bg-[var(--color-muted)]/30 transition-colors">
            <div className="mr-4 mt-0.5 w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <Label className="text-base font-medium cursor-pointer">Module Documentation</Label>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                Affiche l'onglet "Intégration" avec les documents riches liés au projet.
              </p>
            </div>
            <div className="ml-4 flex items-center">
              <Switch 
                checked={currentSettings.modules.integration}
                disabled={isPending}
                onCheckedChange={(c: boolean) => handleToggleModule("integration", c)}
              />
            </div>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-border)]" />

      {/* SECTION : BRANDING INCORPORATION */}
      <section className="flex flex-col gap-4">
        <header>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="text-[var(--color-muted-foreground)] shrink-0" size={18} />
            Marque et Design
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mt-1">
            Adaptez l'apparence du portail aux couleurs de votre client de façon premium.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 items-start mt-2 border p-5 rounded-xl bg-card shadow-sm">
          {/* APERCU GAUCHE */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Aperçu Menu</span>
            <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center p-3 shadow-md">
              <div 
                className="w-full h-full flex items-center justify-center text-white [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current transition-all"
                dangerouslySetInnerHTML={{ __html: svgCode || `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/></svg>` }}
              />
            </div>
          </div>
          
          {/* ZONE TEXTE DROITE */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
            <Label className="text-sm">Code SVG du logo (Monochrome)</Label>
            <Textarea 
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="<svg viewBox='0 0 24 24'>...</svg>"
              className="font-mono text-[11px] h-28 resize-none focus-visible:ring-1 bg-muted/40"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-[var(--color-muted-foreground)] leading-tight max-w-[250px]">
                Le code SVG sera automatiquement recoloré en blanc cassé dans la zone client.
              </p>
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleSaveSvg} 
                disabled={isPending || svgCode === (project.iconSvg || "")}
                className="gap-2 shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
              >
                Sauvegarder l'icône
              </Button>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
