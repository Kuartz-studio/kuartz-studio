"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const priorityMap = {
  0: { label: "N/A", color: "bg-slate-100 text-slate-800" },
  1: { label: "Basse", color: "bg-blue-100 text-blue-800" },
  2: { label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  3: { label: "Haute", color: "bg-orange-100 text-orange-800" },
  4: { label: "Urgente", color: "bg-red-100 text-red-800" },
};

const statusMap = {
  BACKLOG: { label: "Backlog", variant: "secondary" as const },
  TODO: { label: "À faire", variant: "secondary" as const },
  IN_PROGRESS: { label: "En cours", variant: "default" as const },
  PAUSED: { label: "En pause", variant: "outline" as const },
  DONE: { label: "Terminé", variant: "outline" as const },
  CANCELED: { label: "Annulé", variant: "destructive" as const },
};

export function TasksTable({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
        Aucune tâche créée pour ce projet.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-mono text-muted-foreground text-xs">
                #{task.issueNumber}
              </TableCell>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant={statusMap[task.status as keyof typeof statusMap]?.variant || "secondary"}>
                  {statusMap[task.status as keyof typeof statusMap]?.label || task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`font-normal ${priorityMap[task.priority as keyof typeof priorityMap]?.color || ""}`}>
                  {priorityMap[task.priority as keyof typeof priorityMap]?.label || task.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Détails</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
