import { db } from "@/db";
import { documents, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/documents/DocumentEditor";

export default async function DocumentDetailPage({ params }: { params: Promise<{ slug: string; documentSlug: string }> }) {
  const { slug, documentSlug } = await params;
  
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) notFound();

  const [document] = await db.select().from(documents).where(and(eq(documents.projectId, project.id), eq(documents.slug, documentSlug))).limit(1);
  if (!document) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <DocumentEditor 
        document={document} 
        projectSlug={project.slug} 
      />
    </div>
  );
}
