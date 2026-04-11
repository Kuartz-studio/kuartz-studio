import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function DocumentsLoading() {
  return (
    <TableSkeleton
      title="Fichiers & Liens"
      subtitle="Centralisez les liens et fichiers de vos projets."
      columns={5}
      rows={6}
    />
  );
}
