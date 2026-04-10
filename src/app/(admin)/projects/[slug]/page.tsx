import { db } from "@/db";
import { projects, tasks, documents, users, taskAssignees, taskTags, tags as dbTags, projectToUser } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2, FileText, ChevronRight } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects";
import { TasksTable } from "@/components/tasks/TasksTable";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";
import { NewDocumentDialog } from "@/components/documents/NewDocumentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

  if (!project) notFound();

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id)).orderBy(desc(tasks.issueNumber));
  const projectDocs = await db.select().from(documents).where(eq(documents.projectId, project.id)).orderBy(desc(documents.updatedAt));

  const fetchedTaskIds = projectTasks.length > 0 ? projectTasks.map(t => t.id) : ["NONE"];

  const [allTaskAssignees, allTaskTags, allUsersRows, allTagsWithColor] = await Promise.all([
    db.select().from(taskAssignees).where(inArray(taskAssignees.taskId, fetchedTaskIds)),
    db.select().from(taskTags).where(inArray(taskTags.taskId, fetchedTaskIds)),
    db.select({ id: users.id, name: users.name, email: users.email, avatarBase64: users.avatarBase64, role: users.role }).from(users),
    db.select().from(dbTags)
  ]);

  const enrichedTasks = projectTasks.map(task => {
    // For project tasks, they are all from the same project
    
    // Aggregate Assignees
    const tAssigneesIds = allTaskAssignees.filter(ta => ta.taskId === task.id).map(ta => ta.userId);
    const usersForTask = allUsersRows.filter(u => tAssigneesIds.includes(u.id));
    const assignees = usersForTask.map(u => ({ user: u }));

    // Aggregate Tags
    const tTagIds = allTaskTags.filter(tt => tt.taskId === task.id).map(tt => tt.tagId);
    const tagsForTask = allTagsWithColor.filter(t => tTagIds.includes(t.id));
    const tags = tagsForTask.map(t => ({ tag: t }));

    return {
      ...task,
      targetDate: task.targetDate ? task.targetDate.toISOString() : null,
      projectName: project.name,
      projectSlug: project.slug,
      projectLogoBase64: project.logoBase64,
      assignees,
      tags
    };
  });

  const usersForDropdown = allUsersRows.map(u => ({ ...u, email: "", avatarBase64: null, role: "employee" }));

  // Build projectUserMap for this project
  const projectMembers = await db.select({ userId: projectToUser.userId }).from(projectToUser).where(eq(projectToUser.projectId, project.id));
  const projectUserMap: Record<string, string[]> = {
    [project.id]: projectMembers.map(pm => pm.userId),
  };

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

      <Tabs defaultValue="tasks" className="w-full mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex flex-col gap-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Tâches</h2>
            <NewTaskDialog projectId={project.id} />
          </div>
          <TasksTable 
            tasks={enrichedTasks} 
            allTags={allTagsWithColor} 
            allUsers={usersForDropdown} 
            allProjects={[project]} 
            projectUserMap={projectUserMap}
          />
        </TabsContent>

        <TabsContent value="docs" className="flex flex-col gap-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
            <NewDocumentDialog projectId={project.id} />
          </div>

          <div className="bg-card rounded-md border flex flex-col divide-y">
            {projectDocs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground border-none">
                Aucun document. Cliquez sur "Nouveau Document" pour commencer.
              </div>
            ) : (
              projectDocs.map(doc => (
                <Link 
                  key={doc.id} 
                  href={`/documents/${doc.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground" size={20} />
                    <span className="font-medium text-sm">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Modifié le {doc.updatedAt?.toLocaleDateString("fr-FR")}</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
