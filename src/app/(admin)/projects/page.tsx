import { db } from "@/db";
import { projects } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { desc } from "drizzle-orm";

export default async function ProjectsListPage() {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-1">Supervisez et gérez les projets de vos clients.</p>
        </div>
        <Link href="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FolderKanban size={48} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Aucun projet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Vous n'avez pas encore créé de projet. Commencez par en ajouter un pour structurer le travail.
            </p>
            <Link href="/projects/new">
              <Button variant="outline">Créer un projet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <Card className="hover:border-primary/50 hover:shadow-sm transition-all h-full cursor-pointer">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{project.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description || "Aucune description fournie."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
