import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
}

export function TableSkeleton({ 
  columns = 5, 
  rows = 8, 
  showFilters = false,
  showHeader = true,
  title,
  subtitle
}: TableSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {title ? (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            ) : (
              <Skeleton className="h-9 w-40" />
            )}
            {subtitle ? (
              <p className="text-muted-foreground">{subtitle}</p>
            ) : (
              <Skeleton className="h-4 w-72" />
            )}
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-card p-4 rounded-xl border flex gap-3">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-4 py-3 border-b bg-muted/30">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 max-w-32" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1"
                style={{ maxWidth: colIndex === 0 ? "2rem" : colIndex === 1 ? "16rem" : "8rem" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
