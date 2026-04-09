import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, FolderKanban, CheckSquare, Users } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  
  if (!session) {
    redirect("/login");
  }

  // C'est un client (Customer) ? Il va sur son portail séparé.
  if (session.role === "customer") {
    redirect("/portal");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-card/50 border-r flex flex-col p-4 gap-6 shrink-0">
        <div className="font-bold text-xl px-2 tracking-tight">Kuartz Studio</div>
        <nav className="flex flex-col gap-1 flex-grow">
          <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
            <CheckSquare size={18} />
            Tâches
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
            <FolderKanban size={18} />
            Projets
          </Link>
          <Link href="/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
            <Users size={18} />
            Utilisateurs
          </Link>
        </nav>
        <div className="mt-auto border-t pt-4">
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <LogOut size={18} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
