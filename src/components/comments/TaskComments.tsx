"use client";

import { useState, useTransition, useOptimistic } from "react";
import { createCommentAction, deleteCommentAction } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send, MessageSquare } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  createdAt: Date | null;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
};

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(date: Date | null) {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function TaskComments({ taskId, initialComments }: { taskId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("content", content);

    startTransition(async () => {
      const result = await createCommentAction({}, formData);
      if (result?.data?.success) {
        setContent("");
        // Refetch
        window.location.reload();
      }
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (result?.data?.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageSquare size={18} />
        <span className="text-sm font-medium">{comments.length} commentaire{comments.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0 overflow-hidden">
              {comment.authorAvatar ? (
                <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(comment.authorName)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.authorName || "Inconnu"}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-0.5">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Aucun commentaire pour le moment.</p>
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={2}
          className="flex-1 text-sm resize-none"
        />
        <Button type="submit" size="icon" disabled={isPending || !content.trim()} className="flex-shrink-0">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
