"use client";

import { useState, useTransition } from "react";
import { updateDocumentContentAction, updateDocumentTitleAction, deleteDocumentAction } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { documents } from "@/db/schema";

type DocumentRecord = typeof documents.$inferSelect;

export function DocumentEditor({ document, projectSlug }: { document: DocumentRecord; projectSlug?: string }) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || "");
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      let newSlug = document.slug;

      if (title !== document.title) {
        const titleRes = await updateDocumentTitleAction(document.id, title);
        if (titleRes?.data && "slug" in titleRes.data && typeof titleRes.data.slug === "string") {
          newSlug = titleRes.data.slug;
        }
      }

      if (content !== document.content) {
        await updateDocumentContentAction(document.id, content);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      if (newSlug !== document.slug) {
        router.replace(`/documents/${newSlug}`);
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      startTransition(async () => {
        await deleteDocumentAction(document.id);
        router.push("/documents");
      });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-transparent shadow-none h-auto px-2 focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
            <Trash2 size={16} />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-2 w-[110px]">
            <Save size={16} />
            {isPending ? "Attente..." : isSaved ? "Sauvegardé" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border flex flex-col overflow-hidden">
        <textarea
          className="w-full h-full p-6 bg-transparent border-none resize-none focus:outline-none font-mono text-sm leading-relaxed"
          placeholder="Rédigez votre document en Markdown ici..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
