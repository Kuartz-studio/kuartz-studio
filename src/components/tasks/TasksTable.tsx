"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { StatusIcon, PriorityIcon, AvatarCustom } from "@/components/ui/table-icons";

export function TasksTable({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 border border-[var(--color-border)] border-dashed rounded-xl bg-[var(--color-card)]/50 text-[var(--color-muted-foreground)] text-sm">
        Aucune tâche trouvée.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-y-auto bg-[var(--color-card)] flex flex-col flex-1 max-h-full custom-scrollbar relative">
      <div className="flex-1 p-0">
        <table className="text-sm border-collapse w-full relative table-fixed">
          <thead className="sticky top-0 z-10 shadow-sm bg-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 text-left w-24 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">ID</span>
              </th>
              <th className="px-4 py-3 text-left border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Titre</span>
              </th>
              <th className="px-4 py-3 text-center w-24 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Statut</span>
              </th>
              <th className="px-4 py-3 text-center w-24 border-b border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-medium text-[var(--color-muted-foreground)] tracking-wide">Priorité</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.tr
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/40 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-2">
                    <Link href={`/tasks/${task.id}`} className="block">
                      <span className="font-mono text-xs font-medium text-[var(--color-muted-foreground)]">
                        #{task.issueNumber}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/tasks/${task.id}`} className="block">
                      <span className="text-[13px] font-medium text-[var(--color-foreground)] group-hover:underline group-hover:decoration-dashed group-hover:decoration-[var(--color-muted-foreground)] underline-offset-2 truncate block">
                        {task.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center text-[var(--color-muted-foreground)]">
                      <StatusIcon value={task.status} />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center text-[var(--color-muted-foreground)]">
                      <PriorityIcon value={task.priority} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
