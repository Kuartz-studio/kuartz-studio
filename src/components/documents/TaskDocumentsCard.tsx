"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { DocumentSheet } from "@/components/documents/DocumentSheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type LinkedDoc = {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  projectId?: string | null;
};

type Props = {
  linkedDocs: LinkedDoc[];
  allProjects: { id: string; name: string }[];
  projectId: string | null;
  taskId: string;
};

export function TaskDocumentsCard({ linkedDocs, allProjects, projectId, taskId }: Props) {
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | null>(null);
  const [activeDoc, setActiveDoc] = useState<LinkedDoc | null>(null);

  const handleOpenCreate = () => {
    setActiveDoc(null);
    setSheetMode("create");
  };

  const handleOpenEdit = (doc: LinkedDoc) => {
    setActiveDoc(doc);
    setSheetMode("edit");
  };

  const handleClose = () => {
    setSheetMode(null);
    setActiveDoc(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Documents</CardTitle>
        <Button variant="secondary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus size={16} /> Nouveau Document
        </Button>
      </CardHeader>
      <CardContent>
        {linkedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun document lié à cette tâche.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {linkedDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => handleOpenEdit(doc)}
                className="flex items-center text-left gap-2 p-2 rounded-md hover:bg-[var(--color-muted)] transition-colors text-sm text-[var(--color-foreground)] hover:underline"
              >
                <FileText size={16} className="text-[var(--color-muted-foreground)] shrink-0" />
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </CardContent>

      <DocumentSheet 
        open={sheetMode !== null} 
        onOpenChange={(val) => !val && handleClose()} 
        mode={sheetMode || "create"} 
        prefillTaskId={taskId} 
        document={activeDoc || { projectId }}
        allProjects={allProjects}
      />
    </Card>
  );
}
