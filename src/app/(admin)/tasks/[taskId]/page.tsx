import { db } from "@/db";
import { tasks, projects, users, taskAssignees, taskTags, tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTaskComments } from "@/actions/comments";
import { TaskComments } from "@/components/comments/TaskComments";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  BACKLOG: { label: "Backlog", variant: "secondary" },
  TODO: { label: "À faire", variant: "secondary" },
  IN_PROGRESS: { label: "En cours", variant: "default" },
  PAUSED: { label: "En pause", variant: "outline" },
  DONE: { label: "Terminé", variant: "outline" },
  CANCELED: { label: "Annulé", variant: "destructive" },
};

const priorityMap: Record<number, string> = {
  0: "N/A", 1: "Basse", 2: "Moyenne", 3: "Haute", 4: "Urgente",
};

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;

  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) notFound();

  const [project] = await db.select({ id: projects.id, name: projects.name, slug: projects.slug }).from(projects).where(eq(projects.id, task.projectId)).limit(1);

  // Get creator
  const [creator] = await db.select({ name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, task.createdByUserId)).limit(1);

  // Get assignees
  const assigneeRows = await db
    .select({ name: users.name, avatarUrl: users.avatarUrl })
    .from(taskAssignees)
    .leftJoin(users, eq(taskAssignees.userId, users.id))
    .where(eq(taskAssignees.taskId, taskId));

  // Get tags
  const tagRows = await db
    .select({ name: tags.name, color: tags.color })
    .from(taskTags)
    .leftJoin(tags, eq(taskTags.tagId, tags.id))
    .where(eq(taskTags.taskId, taskId));

  // Get comments
  const taskComments = await getTaskComments(taskId);

  const status = statusMap[task.status] || { label: task.status, variant: "secondary" as const };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-muted-foreground text-sm">#{task.issueNumber}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">{task.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm">{task.description}</p>
              ) : (
                <p className="text-muted-foreground italic text-sm">Aucune description.</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskComments taskId={taskId} initialComments={taskComments} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Projet</span>
                {project ? (
                  <Link href={`/projects/${project.slug}`} className="text-primary hover:underline font-medium">{project.name}</Link>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Priorité</span>
                <span>{priorityMap[task.priority] || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Créé par</span>
                <span>{creator?.name || "Inconnu"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Assigné à</span>
                {assigneeRows.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {assigneeRows.map((a, i) => (
                      <span key={i}>{a.name || "Inconnu"}</span>
                    ))}
                  </div>
                ) : (
                  <span className="italic text-muted-foreground">Personne</span>
                )}
              </div>
              {tagRows.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {tagRows.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs" style={t.color ? { borderColor: t.color, color: t.color } : {}}>
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Date cible</span>
                <span>{task.targetDate ? task.targetDate.toLocaleDateString("fr-FR") : "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Créé le</span>
                <span>{task.createdAt?.toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
