import { db } from "@/db";
import { users, projects, projectToUser } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UsersTable } from "@/components/users/UsersTable";

export default async function UsersListPage() {
  const allUsers = await db.select().from(users);
  const allProjects = await db.select({ id: projects.id, name: projects.name, slug: projects.slug }).from(projects);
  const allLinks = await db
    .select({
      userId: projectToUser.userId,
      projectId: projectToUser.projectId,
      projectName: projects.name,
      projectSlug: projects.slug,
    })
    .from(projectToUser)
    .leftJoin(projects, eq(projectToUser.projectId, projects.id));

  // Group projects by user
  const userProjects = new Map<string, { id: string; name: string | null; slug: string | null }[]>();
  for (const link of allLinks) {
    const existing = userProjects.get(link.userId) ?? [];
    existing.push({ id: link.projectId, name: link.projectName, slug: link.projectSlug });
    userProjects.set(link.userId, existing);
  }

  const usersWithProjects = allUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    projects: userProjects.get(u.id) ?? [],
  }));

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez l'équipe Kuartz et tous vos clients.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={16} /> Ajouter
        </Button>
      </div>

      <UsersTable users={usersWithProjects} allProjects={allProjects} />
    </div>
  );
}
