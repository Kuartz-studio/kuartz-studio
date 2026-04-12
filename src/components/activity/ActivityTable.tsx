"use client";

import { useState, useTransition, useMemo } from "react";
import { markActivityReadAction, markAllActivitiesReadAction } from "@/actions/activities";
import { CheckCheck, Eye, EyeOff, ExternalLink, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TYPE_CONFIG: Record<string, { label: string; dot: string }> = {
  task_created:       { label: "Tâche créée",       dot: "#22C55E" },
  task_status_changed:{ label: "Statut modifié",    dot: "#3B82F6" },
  task_deleted:       { label: "Tâche supprimée",   dot: "#EF4444" },
  comment_created:    { label: "Commentaire",       dot: "#A855F7" },
  document_created:   { label: "Document créé",     dot: "#EAB308" },
  document_updated:   { label: "Document modifié",  dot: "#EAB308" },
  attachment_added:   { label: "Fichier ajouté",    dot: "#F97316" },
  project_created:    { label: "Projet créé",       dot: "#14B8A6" },
};

const ENTITY_ROUTES: Record<string, string> = {
  task: "/tasks",
  project: "/projects",
  document: "/documents",
  comment: "/tasks",
  attachment: "/tasks",
};

function formatDate(date: Date | null) {
  if (!date) return "—";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ActivityRow = {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  entityTitle: string | null;
  metadata: string | null;
  read: boolean;
  createdAt: Date | null;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function AvatarMini({ name, avatarSrc }: { name: string | null; avatarSrc: string | null }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[var(--color-border)] bg-[var(--color-muted)] flex items-center justify-center">
      {avatarSrc ? (
        <img src={avatarSrc} alt={name ?? ""} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-[var(--color-muted-foreground)]">{initial}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
import { cn } from "@/lib/utils";

function SortableHeader({ label, sortKey, sortConfig, onSort, align = "left", className = "" }: { label: string, sortKey: string, sortConfig: { key: string, direction: "asc" | "desc" } | null, onSort: (key: string) => void, align?: "left" | "center" | "right", className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 font-medium border-b border-[var(--color-border)]", className)}>
      <button 
        className={cn("flex items-center gap-1.5 text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide hover:text-[var(--color-foreground)] transition-colors outline-none", align === "center" && "mx-auto", align === "right" && "ml-auto")}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );
}

export function ActivityTable({ activities }: { activities: ActivityRow[] }) {
  const [localActivities, setLocalActivities] = useState(activities);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = useMemo(() => {
    if (!sortConfig) return localActivities;
    return [...localActivities].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case "type": valA = TYPE_CONFIG[a.type]?.label || a.type; valB = TYPE_CONFIG[b.type]?.label || b.type; break;
        case "user": valA = a.userName?.toLowerCase() ?? ""; valB = b.userName?.toLowerCase() ?? ""; break;
        case "date": valA = a.createdAt ? new Date(a.createdAt).getTime() : 0; valB = b.createdAt ? new Date(b.createdAt).getTime() : 0; break;
        default: valA = 0; valB = 0;
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [localActivities, sortConfig]);

  const unreadCount = localActivities.filter(a => !a.read).length;

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markActivityReadAction(id);
      setLocalActivities(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllActivitiesReadAction();
      setLocalActivities(prev => prev.map(a => ({ ...a, read: true })));
    });
  };

  const getEntityLink = (activity: ActivityRow): string | null => {
    const base = ENTITY_ROUTES[activity.entityType];
    if (!base) return null;
    // For tasks we just go to /tasks (the ID isn't a URL slug)
    // For projects we'd need a slug — just go to /projects
    return base;
  };

  const getTypeInfo = (type: string) => {
    return TYPE_CONFIG[type] ?? { label: type, dot: "#A8A29E" };
  };

  const getMetaDescription = (activity: ActivityRow): string | null => {
    if (!activity.metadata) return null;
    try {
      const meta = JSON.parse(activity.metadata) as Record<string, unknown>;
      if (meta.status && typeof meta.status === "string") return `→ ${meta.status}`;
      if (meta.field && typeof meta.field === "string") return `${meta.field} modifié`;
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{localActivities.length} activités</span>
          {unreadCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {unreadCount} non lues
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck size={13} /> Tout marquer lu
          </Button>
        )}
      </div>

      {/* Table */}
      {localActivities.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground italic">
          Aucune activité enregistrée pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-medium w-8 border-b border-[var(--color-border)]"></th>
                <SortableHeader label="Type" sortKey="type" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Utilisateur" sortKey="user" sortConfig={sortConfig} onSort={requestSort} />
                <th className="px-4 py-2.5 text-left font-medium border-b border-[var(--color-border)]"><span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Description</span></th>
                <th className="px-4 py-2.5 text-left font-medium border-b border-[var(--color-border)]"><span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Détail</span></th>
                <SortableHeader label="Date" sortKey="date" sortConfig={sortConfig} onSort={requestSort} />
                <th className="px-4 py-2.5 text-center font-medium w-16 border-b border-[var(--color-border)]"></th>
              </tr>
            </thead>
            <tbody>
              {sortedActivities.map((activity) => {
                const typeInfo = getTypeInfo(activity.type);
                const metaDesc = getMetaDescription(activity);
                const link = getEntityLink(activity);

                return (
                  <tr
                    key={activity.id}
                    className={`border-b last:border-b-0 transition-colors hover:bg-muted/30 ${!activity.read ? "bg-primary/[0.03]" : ""}`}
                  >
                    {/* Read indicator */}
                    <td className="px-4 py-2.5">
                      {!activity.read && (
                        <div className="w-2 h-2 rounded-full bg-primary" title="Non lu" />
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeInfo.dot }} />
                        <span className="text-[13px] font-medium whitespace-nowrap">{typeInfo.label}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <AvatarMini name={activity.userName} avatarSrc={activity.userAvatar} />
                        <span className="text-[13px] truncate max-w-[120px]">{activity.userName ?? "Système"}</span>
                      </div>
                    </td>

                    {/* Description (entityTitle + metadata) */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5 max-w-[250px]">
                        {activity.entityTitle ? (
                          <span className={`text-[13px] truncate ${!activity.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {activity.entityTitle}
                          </span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground italic">—</span>
                        )}
                        {metaDesc && (
                          <span className="text-[11px] text-muted-foreground/70">{metaDesc}</span>
                        )}
                      </div>
                    </td>

                    {/* Entity type */}
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium uppercase tracking-wider">
                        {activity.entityType}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-2.5">
                      <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors outline-none mx-auto cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          {link && (
                            <DropdownMenuItem onClick={() => router.push(link)} className="cursor-pointer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Accéder
                            </DropdownMenuItem>
                          )}
                          {!activity.read ? (
                            <DropdownMenuItem onClick={() => handleMarkRead(activity.id)} disabled={isPending} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              Marquer comme lu
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="opacity-50">
                              <EyeOff className="h-4 w-4 mr-2" />
                              Lu
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
