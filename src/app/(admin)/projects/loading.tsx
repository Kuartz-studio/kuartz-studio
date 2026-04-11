import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function ProjectsLoading() {
  return (
    <TableSkeleton
      title="Projets"
      subtitle="Supervisez et gérez les projets de vos clients."
      columns={5}
      rows={6}
    />
  );
}
