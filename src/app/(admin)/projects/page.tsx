import { db } from "@/db";
import { users } from "@/db/schema";
import { getProjectsWithUsers } from "@/actions/projects";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { desc } from "drizzle-orm";

export default async function ProjectsListPage() {
  const projectsWithUsers = await getProjectsWithUsers();
  const allUsers = await db.select({ id: users.id, name: users.name, avatarBase64: users.avatarBase64, role: users.role }).from(users);

  // Map to the shape expected by ProjectsTable
  const usersForTable = allUsers.map(u => ({ id: u.id, name: u.name, avatarBase64: u.avatarBase64, role: u.role }));

  return (
    <div className="flex flex-col gap-8 flex-1">
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

      {projectsWithUsers.length === 0 ? (
        <Card className="border-dashed h-64 flex flex-col items-center justify-center bg-[var(--color-card)]/50">
          <CardContent className="flex flex-col items-center justify-center text-center p-0">
            <FolderKanban size={48} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Aucun projet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Vous n&apos;avez pas encore créé de projet. Commencez par en ajouter un pour structurer le travail.
            </p>
            <Link href="/projects/new">
              <Button variant="outline">Créer un projet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ProjectsTable projects={projectsWithUsers} allUsers={usersForTable} />
      )}
    </div>
  );
}
