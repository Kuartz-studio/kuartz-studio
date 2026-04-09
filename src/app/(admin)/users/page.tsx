import { db } from "@/db";
import { users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function UsersListPage() {
  const allUsers = await db.select().from(users);

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

      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col">
        <table className="text-sm border-collapse w-full relative table-fixed">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 text-left w-16 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Avatar</span>
              </th>
              <th className="px-4 py-3 text-left w-[25%] border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Nom</span>
              </th>
              <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Email</span>
              </th>
              <th className="px-4 py-3 text-left w-24 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Rôle</span>
              </th>
              <th className="px-4 py-3 text-right w-20 border-b border-[var(--color-border)]"></th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group">
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--color-muted)] border border-[var(--color-border)] shrink-0">
                    <span className="text-[11px] font-bold text-[var(--color-muted-foreground)]">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-[13px] font-medium text-[var(--color-foreground)] truncate block">
                    {user.name}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="text-[13px] text-[var(--color-muted-foreground)] truncate block">
                    {user.email}
                  </span>
                </td>
                <td className="px-4 py-2">
                   <Badge variant={user.role === "admin" ? "default" : user.role === "employee" ? "secondary" : "outline"} className="text-[10px] uppercase">
                    {user.role === "admin" ? "Admin" : user.role === "employee" ? "Employé" : "Client"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs">
                    Gérer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
