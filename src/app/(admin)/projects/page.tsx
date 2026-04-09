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

      {allProjects.length === 0 ? (
        <Card className="border-dashed h-64 flex flex-col items-center justify-center bg-[var(--color-card)]/50">
          <CardContent className="flex flex-col items-center justify-center text-center p-0">
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
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col">
          <table className="text-sm border-collapse w-full relative table-fixed">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 text-left w-16 border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Logo</span>
                </th>
                <th className="px-4 py-3 text-left w-[30%] border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Projet</span>
                </th>
                <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Description</span>
                </th>
                <th className="px-4 py-3 text-left w-32 border-b border-[var(--color-border)]">
                  <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Slug</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {allProjects.map((project) => (
                <tr key={project.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group cursor-pointer relative">
                  <td className="px-4 py-2">
                    <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10" />
                    <div className="flex items-center justify-center h-8 w-8 rounded bg-[var(--color-muted)] border border-[var(--color-border)] shrink-0">
                      <FolderKanban className="h-4 w-4 text-[var(--color-muted-foreground)] opacity-50" />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[13px] font-medium text-[var(--color-foreground)] truncate block group-hover:underline group-hover:decoration-dashed group-hover:decoration-[var(--color-muted-foreground)] underline-offset-2">
                      {project.name}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[12px] text-[var(--color-muted-foreground)] truncate block max-w-full">
                      {project.description || <span className="italic opacity-50">Aucune description</span>}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[12px] font-mono text-[var(--color-muted-foreground)] truncate block bg-[var(--color-muted)] px-1.5 py-0.5 rounded max-w-max">
                      {project.slug}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
