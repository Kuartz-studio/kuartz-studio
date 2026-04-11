"use client";



type DocumentData = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  updatedAt: string | null;
};

export function ClientDocumentRenderer({ document }: { document: DocumentData }) {
  if (!document.content) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-xl mt-4 bg-card/50">
        <p className="text-muted-foreground text-lg mb-2">Document vide</p>
        <p className="text-sm text-muted-foreground/80">Ce document ne contient pas encore de texte.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-8 md:p-12 shadow-sm text-left w-full mt-4">
      <article 
        className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-muted-foreground prose-headings:font-bold"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />
    </div>
  );
}
