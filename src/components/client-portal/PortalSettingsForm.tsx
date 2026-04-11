"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw, ExternalLink, Image as ImageIcon, CheckSquare, FileText, Globe, Settings, ChevronDown, Layers, Palette, PenTool, Type } from "lucide-react";
import { FramerIcon } from "@/components/icons";
import { updatePortalSettingsAction, updatePortalSvgAction, regeneratePortalTokenAction } from "@/actions/projects";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

type PortalSettings = {
  modules: {
    tasks?: boolean;
    files?: boolean;
    [key: string]: boolean | undefined;
  };
};

type Props = {
  project: {
    id: string;
    slug: string;
    clientPortalToken: string | null;
    logoBase64: string | null;
    portalSettings: PortalSettings | null;
    contentCounts: { tasks: number; documents: number; files: number; documentCategories?: Record<string, number> };
  };
};

export function PortalSettingsForm({ project }: Props) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const defaultSettings: PortalSettings = {
    modules: { tasks: true, files: true },
  };

  const [currentSettings, setCurrentSettings] = useState<PortalSettings>(project.portalSettings || defaultSettings);

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
    setCurrentSettings(newSettings);
    startTransition(async () => {
      await updatePortalSettingsAction(project.id, newSettings);
      toast.success("Paramètres mis à jour");
    });
  };

  const handleRegenerateToken = () => {
    startTransition(async () => {
      await regeneratePortalTokenAction(project.id);
      toast.success("Lien secret régénéré avec succès");
      setIsAlertOpen(false);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECTION UNIQUE : REGLAGES PRINCIPAUX */}
      <section className="flex flex-col gap-6">
        <header>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">
            Réglages principaux
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mt-1">
            Gérez le lien d'accès sécurisé et la visibilité des onglets pour ce portail espace client.
          </p>
        </header>
        
        {/* Lien Input */}
        <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)]/30 focus-within:border-[var(--primary)]/50 transition-all">
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
              onClick={() => setIsAlertOpen(true)}
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

        {/* Fausse Sidebar de GAUCHE (Schéma) */}
        <div className="flex border border-[var(--color-border)] rounded-xl overflow-hidden bg-card shadow-sm max-w-3xl">
          <div className="w-[320px] bg-sidebar flex flex-col shrink-0 border-r border-[var(--color-border)] py-4 opacity-90 relative">
             
             {/* Header Logo */}
             <div className="px-4 flex items-center gap-3 shrink-0 mb-6">
                <div className="w-8 h-8 flex flex-col items-center justify-center shrink-0 bg-transparent rounded-md shadow-sm border overflow-hidden">
                  {project.logoBase64 ? (
                    <img src={project.logoBase64} alt={project.slug} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-sidebar-foreground">{project.slug.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="font-bold tracking-tight truncate flex-1 text-sidebar-foreground">{project.slug.toUpperCase()}</span>
             </div>

             <div className="px-3 flex flex-col gap-2">
               
               {/* Item Tâches */}
               {(() => {
                 const hasContent = project.contentCounts.tasks > 0;
                 const isActive = hasContent && currentSettings.modules.tasks !== false;
                 return (
                   <div className={`flex items-center justify-between p-2 rounded-md transition-opacity ${!hasContent ? "opacity-30" : isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                     <div className="flex items-center gap-3 text-sm font-medium">
                       <div className="shrink-0"><CheckSquare size={16} /></div>
                       <span>Tâches</span>
                     </div>
                     {hasContent && (
                       <Switch 
                         checked={currentSettings.modules.tasks !== false}
                         disabled={isPending}
                         onCheckedChange={(c: boolean) => handleToggleModule("tasks", c)}
                       />
                     )}
                   </div>
                 );
               })()}

               {/* Document Categories Tabs */}
               {["Framer", "Webflow", "Figma", "Branding", "Design", "Copywriting", "Autre"].map(cat => {
                 const hasContent = (project.contentCounts.documentCategories?.[cat] || 0) > 0;
                 const isActive = hasContent && currentSettings.modules[cat] !== false;
                 
                 let IconComponent: any = Settings;
                 if (cat === "Framer") IconComponent = FramerIcon;
                 else if (cat === "Webflow") IconComponent = Globe;
                 else if (cat === "Figma") IconComponent = Layers;
                 else if (cat === "Branding") IconComponent = Palette;
                 else if (cat === "Design") IconComponent = PenTool;
                 else if (cat === "Copywriting") IconComponent = Type;

                 return (
                   <div key={cat} className={`flex items-center justify-between p-2 rounded-md transition-opacity ${!hasContent ? "opacity-30 hidden" : isActive ? "text-sidebar-foreground" : "text-muted-foreground"}`}>
                     <div className="flex items-center gap-3 text-sm font-medium">
                       <div className="shrink-0"><IconComponent className="w-4 h-4" /></div>
                       <span>{cat}</span>
                     </div>
                     {hasContent && (
                       <div className="flex items-center gap-2">
                         <ChevronDown size={14} className="opacity-50" />
                         <Switch 
                           checked={currentSettings.modules[cat] !== false}
                           disabled={isPending}
                           onCheckedChange={(c: boolean) => handleToggleModule(cat, c)}
                         />
                       </div>
                     )}
                   </div>
                 );
               })}

               {/* Item Documents */}
               {(() => {
                 const hasContent = project.contentCounts.files > 0;
                 const isActive = hasContent && currentSettings.modules.files !== false;
                 return (
                   <div className={`flex items-center justify-between p-2 rounded-md transition-opacity ${!hasContent ? "opacity-30" : isActive ? "text-sidebar-foreground" : "text-muted-foreground"}`}>
                     <div className="flex items-center gap-3 text-sm font-medium">
                       <div className="shrink-0"><FileText size={16} /></div>
                       <span>Documents</span>
                     </div>
                     {hasContent && (
                       <div className="flex items-center gap-2">
                         <ChevronDown size={14} className="opacity-50" />
                         <Switch 
                           checked={currentSettings.modules.files !== false}
                           disabled={isPending}
                           onCheckedChange={(c: boolean) => handleToggleModule("files", c)}
                         />
                       </div>
                     )}
                   </div>
                 );
               })()}

             </div>
          </div>

          {/* Description Droite */}
          <div className="flex-1 p-8 flex flex-col justify-center bg-muted/20">
             <div className="max-w-xs mx-auto text-center flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                   <ImageIcon size={20} />
                </div>
                <h4 className="font-semibold">Bascule des Menus</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Les sections contenant du contenu sont activées par défaut. Vous pouvez les masquer manuellement. Les sections grisées n&apos;ont pas encore de contenu associé à ce projet.
                </p>
             </div>
          </div>
        </div>
      </section>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer le lien du portail ?</AlertDialogTitle>
            <AlertDialogDescription>
              En régénérant ce lien, l'ancien raccourci d'accès que vous avez déjà partagé avec vos clients cessera de fonctionner <b>immédiatement</b>. Ils devront utiliser le nouveau lien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Annuler</AlertDialogCancel>
            <Button variant="destructive" onClick={handleRegenerateToken} disabled={isPending}>
              {isPending ? "Création en cours..." : "Oui, régénérer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
