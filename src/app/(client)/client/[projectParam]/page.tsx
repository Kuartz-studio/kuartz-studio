import { db } from "@/db";
import { projects, projectToUser, users, tasks } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { CharacterSelector } from "@/components/client-portal/CharacterSelector";

export const dynamic = "force-dynamic";

/**
 * Parse the composite URL param: "slug-token"
 * The slug can contain dashes, so we match the last 12 characters as the token.
 */
function parseProjectParam(param: string): { slug: string; token: string } | null {
  // Token is always the last 12 hex chars
  if (param.length < 14) return null; // at least 1 char slug + dash + 12 char token
  const token = param.slice(-12);
  const slug = param.slice(0, -(12 + 1)); // Remove "-token" from end
  if (!slug || !token) return null;
  return { slug, token };
}

export default async function ClientPortalPage({ params }: { params: Promise<{ projectParam: string }> }) {
  const { projectParam } = await params;
  const parsed = parseProjectParam(projectParam);

  if (!parsed) notFound();

  const { slug, token } = parsed;

  // Fetch the project using both slug AND token for security
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.clientPortalToken, token)))
    .limit(1);

  if (!project) notFound();

  // Check if an admin is viewing
  const session = await verifySession();
  const isAdmin = session?.role === "admin" || session?.role === "employee";

  // Get customers linked to this project
  const customerLinks = await db
    .select({
      userId: projectToUser.userId,
      role: projectToUser.role,
    })
    .from(projectToUser)
    .where(eq(projectToUser.projectId, project.id));

  // Fetch customer user details
  const customerUserIds = customerLinks
    .filter((link) => link.role === "viewer" || link.role === "member")
    .map((link) => link.userId);

  let customerUsers: { id: string; name: string; avatarBase64: string | null; email: string }[] = [];

  if (customerUserIds.length > 0) {
    const allProjectUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarBase64: users.avatarBase64,
        role: users.role,
      })
      .from(users);

    customerUsers = allProjectUsers
      .filter((u) => customerUserIds.includes(u.id) && u.role === "customer")
      .map(({ id, name, avatarBase64, email }) => ({ id, name, avatarBase64, email }));
  }

  // Get task stats for the dashboard header
  const allTasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.projectId, project.id));

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "DONE").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Project Header */}
      <div className="flex flex-col items-center gap-4 mb-12">
        {project.logoBase64 && (
          <div className="w-16 h-16 rounded-2xl overflow-hidden border shadow-sm">
            <img src={project.logoBase64} alt={project.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2 max-w-md">{project.description}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression du projet</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {doneTasks} / {totalTasks} tâches terminées
          </p>
        </div>
      )}

      {/* Character Selection or Dashboard */}
      <CharacterSelector
        customers={customerUsers}
        isAdmin={isAdmin}
        projectName={project.name}
      />
    </div>
  );
}
