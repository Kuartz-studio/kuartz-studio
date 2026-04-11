import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function DocumentationLoading() {
  return (
    <TableSkeleton
      title="Documentation"
      subtitle="Base de connaissances et documents de référence."
      columns={4}
      rows={5}
    />
  );
}
