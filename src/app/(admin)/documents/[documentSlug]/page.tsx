import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/documents/DocumentEditor";

export default async function DocumentDetailPage({ params }: { params: Promise<{ documentSlug: string }> }) {
  const { documentSlug } = await params;

  const [document] = await db.select().from(documents).where(eq(documents.slug, documentSlug)).limit(1);
  if (!document) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <DocumentEditor document={document} />
    </div>
  );
}
