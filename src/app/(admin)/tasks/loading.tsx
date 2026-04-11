import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function TasksLoading() {
  return (
    <TableSkeleton
      title="Tâches"
      subtitle="Vue globale de toutes les tâches du studio."
      columns={7}
      rows={10}
      showFilters
    />
  );
}
