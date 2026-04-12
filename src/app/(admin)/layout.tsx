import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LogOut, Activity, Book } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { getMyNotifications, getUnreadCount } from "@/actions/notifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { KuartzIcon } from "@/components/icons";
import { TaskIcon, ProjectIcon, UserIcon, DocumentsIcon } from "@/components/ui/table-icons";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  
  if (!session) {
    redirect("/login");
  }

  // C'est un client (Customer) ? Il va sur son portail séparé.
  if (session.role === "customer") {
    redirect("/portal");
  }

  const [currentUser] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const myNotifs = await getMyNotifications();
  const unreadCount = await getUnreadCount();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="w-64 bg-card/50 border-r flex flex-col p-4 gap-6 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <KuartzIcon className="w-6 h-6 text-foreground" />
            <span className="font-bold text-xl tracking-tight">Kuartz</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell notifications={myNotifs} unreadCount={unreadCount} />
          </div>
        </div>
        <SidebarNav
          groups={[
            [
              { path: "/tasks", label: "Tâches", icon: <TaskIcon size={18} /> },
              { path: "/projects", label: "Projets", icon: <ProjectIcon size={18} /> },
              { path: "/users", label: "Utilisateurs", icon: <UserIcon size={18} /> },
            ],
            [
              { path: "/documentation", label: "Documentation", icon: <Book size={18} /> },
              { path: "/documents", label: "Fichiers & Liens", icon: <DocumentsIcon size={18} /> },
              { path: "/activity", label: "Activité", icon: <Activity size={18} /> },
            ],
          ]}
        />
        <div className="flex flex-col border-t pt-4 mt-auto">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border bg-sidebar-accent shadow-sm flex items-center justify-center">
                {currentUser?.avatarBase64 ? (
                  <img src={currentUser.avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-medium text-xs text-sidebar-foreground">
                    {currentUser?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser?.name || "Admin"}
              </span>
            </div>
            
            <form action={logoutAction}>
              <button 
                title="Déconnexion"
                className="flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
