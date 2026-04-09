import { getRecentActivities } from "@/actions/activities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const typeLabels: Record<string, { label: string; color: string }> = {
  task_created: { label: "Tâche créée", color: "bg-green-100 text-green-800" },
  task_status_changed: { label: "Statut modifié", color: "bg-blue-100 text-blue-800" },
  task_deleted: { label: "Tâche supprimée", color: "bg-red-100 text-red-800" },
  comment_created: { label: "Commentaire", color: "bg-purple-100 text-purple-800" },
  document_created: { label: "Document créé", color: "bg-yellow-100 text-yellow-800" },
  document_updated: { label: "Document modifié", color: "bg-yellow-100 text-yellow-800" },
  attachment_added: { label: "Fichier ajouté", color: "bg-orange-100 text-orange-800" },
  project_created: { label: "Projet créé", color: "bg-teal-100 text-teal-800" },
};

const entityTypeLabels: Record<string, string> = {
  task: "Tâche",
  project: "Projet",
  document: "Document",
  comment: "Commentaire",
  attachment: "Fichier",
};

function timeAgo(date: Date | null) {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default async function ActivityPage() {
  const activities = await getRecentActivities(100);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Activité</h1>

      <Card>
        <CardContent className="pt-6">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              Aucune activité enregistrée pour le moment.
            </p>
          ) : (
            <div className="flex flex-col">
              {activities.map((activity, i) => {
                const typeInfo = typeLabels[activity.type] || { label: activity.type, color: "bg-gray-100 text-gray-800" };
                const meta = activity.metadata ? JSON.parse(activity.metadata) : null;

                return (
                  <div key={activity.id} className="flex gap-4 py-3 border-b last:border-b-0">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                      {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{activity.userName || "Système"}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-normal ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                      {activity.entityTitle && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{activity.entityTitle}</p>
                      )}
                      {meta && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {meta.status && `→ ${meta.status}`}
                          {meta.field && `${meta.field} modifié`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
