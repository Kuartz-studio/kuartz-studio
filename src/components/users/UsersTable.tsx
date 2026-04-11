"use client";

import { useState, useMemo, useTransition } from "react";
import { Check, Trash2, Crown, FolderKanban, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarCustom } from "@/components/ui/table-icons";
import { updateUserAction, updateUserProjectsAction, deleteUserAction, updateUserAvatarAction, createUserAction } from "@/actions/users";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserProject { id: string; name: string | null; slug: string | null; logoBase64?: string | null; }
interface ProjectRecord { id: string; name: string; slug: string; logoBase64: string | null; }
interface UserRow {
  id: string; name: string; email: string; role: string;
  avatarBase64: string | null;
  projects: UserProject[];
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employé" },
  { value: "customer", label: "Client" },
];

// ---------------------------------------------------------------------------
// Editable Text Cell
// ---------------------------------------------------------------------------
function EditableTextCell({ value, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        placeholder={placeholder}
        className="h-7 text-[13px] bg-transparent border-[var(--color-border)] focus:ring-1"
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-[13px] truncate block cursor-pointer hover:bg-[var(--color-muted)] px-1 -mx-1 py-0.5 rounded transition-colors"
    >
      {value}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Role Select Cell
// ---------------------------------------------------------------------------
function RoleCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const label = ROLE_OPTIONS.find(r => r.value === value)?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer outline-none" onClick={(e) => { e.stopPropagation(); }}>
        <Badge
          variant={value === "admin" ? "default" : value === "employee" ? "secondary" : "outline"}
          className="text-[10px] uppercase cursor-pointer"
        >
          {label}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-1" align="start">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { onSave(opt.value); setOpen(false); }}
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-[var(--color-muted)] transition-colors"
          >
            <span>{opt.label}</span>
            {value === opt.value && <Check className="h-3 w-3 text-[var(--primary)]" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Projects Multi-Select Cell
// ---------------------------------------------------------------------------
function ProjectsCell({ userProjects, allProjects, isAdmin, onSave }: {
  userProjects: UserProject[]; allProjects: ProjectRecord[]; isAdmin: boolean;
  onSave: (projectIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentIds = useMemo(() => new Set(userProjects.map(p => p.id)), [userProjects]);

  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        All
      </span>
    );
  }

  const toggle = (project: ProjectRecord) => {
    const newIds = new Set(currentIds);
    if (newIds.has(project.id)) newIds.delete(project.id);
    else newIds.add(project.id);
    onSave(Array.from(newIds));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 cursor-pointer outline-none flex-wrap" onClick={(e) => e.stopPropagation()}>
        {userProjects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {userProjects.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)] font-medium"
              >
                {p.logoBase64 ? (
                  <img src={p.logoBase64} alt="" className="h-3.5 w-3.5 rounded-full object-cover shrink-0" />
                ) : (
                  <FolderKanban size={10} className="opacity-50" />
                )}
                {p.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-[var(--color-muted-foreground)] italic border border-dashed border-[var(--color-border)] rounded-full px-2 py-0.5">
            + Projet
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Chercher un projet..." />
          <CommandList>
            <CommandEmpty>Aucun projet.</CommandEmpty>
            <CommandGroup>
              {allProjects.map((project) => (
                <CommandItem key={project.id} onSelect={() => toggle(project)}>
                  <div className="flex items-center gap-2 flex-1">
                    {project.logoBase64 ? (
                      <img src={project.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                    ) : (
                      <FolderKanban size={14} className="opacity-50 shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate">{project.name}</span>
                  </div>
                  {currentIds.has(project.id) && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Main Table
// ---------------------------------------------------------------------------
export function UsersTable({ users, allProjects }: { users: UserRow[]; allProjects: ProjectRecord[] }) {
  const [isPending, startTransition] = useTransition();
  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "employee" | "customer">("customer");

  // Sort: admins → employees → customers
  const sorted = useMemo(() => {
    const roleOrder: Record<string, number> = { admin: 0, employee: 1, customer: 2 };
    return [...users].sort((a, b) => {
      const ra = roleOrder[a.role] ?? 9;
      const rb = roleOrder[b.role] ?? 9;
      if (ra !== rb) return ra - rb;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [users]);

  const handleOpenAdd = () => {
    setNewName("");
    setNewEmail("");
    setNewRole("customer");
    setOpenAdd(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    startTransition(async () => {
      const res = await createUserAction({ name: newName, email: newEmail, role: newRole });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Utilisateur créé");
        setOpenAdd(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez l&apos;équipe Kuartz et tous vos clients.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenAdd}>
          <UserPlus size={16} /> Ajouter
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] flex flex-col">
        <table className="text-sm border-collapse w-full relative table-fixed">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 text-left w-14 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Avatar</span>
              </th>
              <th className="px-4 py-3 text-left w-[18%] border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Nom</span>
              </th>
              <th className="px-4 py-3 text-left w-[28%] border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Email</span>
              </th>
              <th className="px-4 py-3 text-left w-24 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Rôle</span>
              </th>
              <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Projet</span>
              </th>
              <th className="px-4 py-3 text-right w-14 border-b border-[var(--color-border)]"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => {
              const isAdmin = user.role === "admin";
              return (
                <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group">
                  {/* Avatar */}
                  <td className="px-4 py-2">
                    <ImageUpload
                      currentImage={user.avatarBase64}
                      onUpload={async (base64) => { await updateUserAvatarAction(user.id, base64); }}
                      shape="circle"
                      compact
                      fallbackLabel={user.name}
                    />
                  </td>

                  {/* Nom (editable) */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <EditableTextCell
                        value={user.name}
                        onSave={(v) => startTransition(() => { updateUserAction(user.id, { name: v }) })}
                        placeholder="Nom"
                      />
                      {isAdmin && <Crown size={12} className="text-amber-400 shrink-0" />}
                    </div>
                  </td>

                  {/* Email (editable) */}
                  <td className="px-4 py-2">
                    <EditableTextCell
                      value={user.email}
                      onSave={(v) => startTransition(() => { updateUserAction(user.id, { email: v }) })}
                      placeholder="email@example.com"
                    />
                  </td>

                  {/* Rôle (select) */}
                  <td className="px-4 py-2">
                    <RoleCell
                      value={user.role}
                      onSave={(v) => startTransition(() => { updateUserAction(user.id, { role: v as "admin" | "employee" | "customer" }) })}
                    />
                  </td>

                  {/* Projets (multi-select) */}
                  <td className="px-4 py-2">
                    <ProjectsCell
                      userProjects={user.projects}
                      allProjects={allProjects}
                      isAdmin={isAdmin}
                      onSave={(ids) => startTransition(() => { updateUserProjectsAction(user.id, ids) })}
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-2 text-right">
                    {!isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-muted-foreground)] hover:text-destructive"
                        onClick={() => startTransition(() => { deleteUserAction(user.id) })}
                        disabled={isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">Nom</Label>
              <Input
                id="user-name"
                placeholder="Prénom Nom"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">Rôle</Label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val as "admin" | "employee" | "customer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenAdd(false)}>Annuler</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Création..." : "Créer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
