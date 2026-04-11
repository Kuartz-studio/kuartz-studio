import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function UsersLoading() {
  return (
    <TableSkeleton
      title="Utilisateurs"
      subtitle="Gérez les membres de votre équipe et vos clients."
      columns={5}
      rows={8}
    />
  );
}
