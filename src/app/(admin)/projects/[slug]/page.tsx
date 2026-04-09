import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects";
import { TasksTable } from "@/components/tasks/TasksTable";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

  if (!project) notFound();

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id)).orderBy(desc(tasks.issueNumber));

  const safeDeleteAction = deleteProjectAction.bind(null, project.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{project.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={safeDeleteAction}>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 size={16} />
              Supprimer
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vue d'ensemble</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="whitespace-pre-wrap">{project.description}</p>
              ) : (
                <p className="text-muted-foreground italic">Aucune description pour ce projet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Créé le</span>
                <span>{project.createdAt?.toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">Tâches totales</span>
                <span>{projectTasks.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Tâches</h2>
          <NewTaskDialog projectId={project.id} />
        </div>
        <TasksTable tasks={projectTasks} />
      </div>
    </div>
  );
}
