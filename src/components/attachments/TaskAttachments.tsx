"use client";

import { useState, useTransition } from "react";
import { createAttachmentAction, deleteAttachmentAction } from "@/actions/file-attachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Plus, Trash2, ExternalLink } from "lucide-react";

const FORMAT_OPTIONS = [
  { value: "google_doc", label: "Google Doc", icon: "📄" },
  { value: "google_sheet", label: "Google Sheet", icon: "📊" },
  { value: "figma", label: "Figma", icon: "🎨" },
  { value: "notion", label: "Notion", icon: "📝" },
  { value: "drive", label: "Google Drive", icon: "☁️" },
  { value: "github", label: "GitHub", icon: "🐙" },
  { value: "link", label: "Lien web", icon: "🔗" },
  { value: "other", label: "Autre", icon: "📎" },
] as const;

type Attachment = {
  id: string;
  title: string;
  url: string;
  format: string;
  createdAt: Date | null;
};

export function TaskAttachments({ taskId, initialAttachments }: { taskId: string; initialAttachments: Attachment[] }) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("link");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("title", title);
    formData.set("url", url);
    formData.set("format", format);

    startTransition(async () => {
      const result = await createAttachmentAction({}, formData);
      if (result?.data?.success) {
        setTitle("");
        setUrl("");
        setFormat("link");
        setShowForm(false);
        setError(null);
        window.location.reload();
      } else if (result?.error) {
        setError(result.error);
      } else if (result?.fieldErrors) {
        setError(Object.values(result.fieldErrors).flat().join(", "));
      }
    });
  };

  const handleDelete = (attachmentId: string) => {
    startTransition(async () => {
      const result = await deleteAttachmentAction(attachmentId);
      if (result?.data?.success) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      }
    });
  };

  const getFormatInfo = (format: string) => {
    return FORMAT_OPTIONS.find(f => f.value === format) ?? { value: "other" as const, label: "Autre", icon: "📎" };
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Paperclip size={18} />
          <span className="text-sm font-medium">{attachments.length} fichier{attachments.length !== 1 ? "s" : ""}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1 h-7 text-xs">
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</div>
          )}
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titre du fichier"
            className="h-8 text-sm"
            required
          />
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            type="url"
            className="h-8 text-sm"
            required
          />
          <Select value={format} onValueChange={(v) => setFormat(v || "link")}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-7 text-xs">Annuler</Button>
            <Button type="submit" size="sm" disabled={isPending} className="h-7 text-xs">{isPending ? "..." : "Ajouter"}</Button>
          </div>
        </form>
      )}

      {/* Attachments list */}
      <div className="flex flex-col gap-1">
        {attachments.map(att => {
          const fmt = getFormatInfo(att.format);
          return (
            <div key={att.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group text-sm">
              <span className="text-base flex-shrink-0">{fmt.icon}</span>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-primary hover:underline flex items-center gap-1"
              >
                {att.title}
                <ExternalLink size={12} className="flex-shrink-0 opacity-50" />
              </a>
              <span className="text-xs text-muted-foreground flex-shrink-0">{fmt.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(att.id)}
                disabled={isPending}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          );
        })}

        {attachments.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground italic">Aucun fichier attaché.</p>
        )}
      </div>
    </div>
  );
}
