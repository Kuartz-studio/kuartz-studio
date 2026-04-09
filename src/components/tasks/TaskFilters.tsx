"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export function TaskFilters({
  projects,
  users,
  tags
}: {
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
  tags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const setFilter = useCallback((name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(name, value);
    else params.delete(name);
    router.push(pathname + "?" + params.toString());
  }, [searchParams, pathname, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("q", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  const currentProject = searchParams.get("projectId");
  const currentPriority = searchParams.get("priority");
  const currentAssignee = searchParams.get("assignee");
  const currentTag = searchParams.get("tag");

  const hasFilters = currentProject || currentPriority || currentAssignee || currentTag || searchParams.get("q");

  return (
    <div className="flex flex-col xl:flex-row gap-4 max-w-full overflow-x-auto pb-1">
      <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Chercher ID ou Titre..." 
          className="pl-9 bg-background h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <Select value={currentProject || ""} onValueChange={(val) => setFilter("projectId", val)}>
          <SelectTrigger className="w-[140px] bg-background h-9">
            <div className="flex items-center gap-2 truncate"><Filter size={13}/> Projet</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentAssignee || ""} onValueChange={(val) => setFilter("assignee", val)}>
          <SelectTrigger className="w-[140px] bg-background h-9">
            <div className="flex items-center gap-2 truncate"><Filter size={13}/> Utilisateur</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentPriority || ""} onValueChange={(val) => setFilter("priority", val)}>
          <SelectTrigger className="w-[130px] bg-background h-9">
            <div className="flex items-center gap-2 truncate"><Filter size={13}/> Priorité</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="0">N/A</SelectItem>
            <SelectItem value="1">Basse</SelectItem>
            <SelectItem value="2">Moyenne</SelectItem>
            <SelectItem value="3">Haute</SelectItem>
            <SelectItem value="4">Urgente</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={currentTag || ""} onValueChange={(val) => setFilter("tag", val)}>
          <SelectTrigger className="w-[120px] bg-background h-9">
            <div className="flex items-center gap-2 truncate"><Filter size={13}/> Tag</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les tags</SelectItem>
            {tags.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} title="Effacer les filtres" className="h-9 px-3">
            <X size={16} className="mr-2" /> Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
