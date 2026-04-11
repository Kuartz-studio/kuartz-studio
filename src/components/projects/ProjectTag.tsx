import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectTag({
  name,
  logoBase64,
  className
}: {
  name: string;
  logoBase64?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)] font-medium max-w-full overflow-hidden", className)}>
      {logoBase64 ? (
        <img src={logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
      ) : (
        <FolderKanban size={12} className="opacity-50 shrink-0" />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
