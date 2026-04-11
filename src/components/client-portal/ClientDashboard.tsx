"use client";

import { useState } from "react";
import { CheckSquare, FileText, Link as LinkIcon, Settings } from "lucide-react";
import { ClientSidebar } from "./ClientSidebar";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { TasksTable } from "@/components/tasks/TasksTable";
import { ClientDocumentRenderer } from "./ClientDocumentRenderer";

type Props = {
  project: {
    id: string;
    name: string;
    slug: string;
    iconSvg: string | null;
    clientPortalToken: string | null;
    portalSettings: any | null;
  };
  currentUser: { id: string; name: string; avatarBase64: string | null; email: string } | null;
  isAdmin: boolean;
  tasks: any[];
  documents: any[];
  allTags: any[];
  allUsers: any[];
  allProjects: any[];
  projectUserMap: Record<string, string[]>;
};

export function ClientDashboard({ project, currentUser, isAdmin, tasks, documents, allTags, allUsers, allProjects, projectUserMap }: Props) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  const settings = project.portalSettings || { modules: { tasks: true, integration: false, branding: false } };

  const navItems: any[] = [];

  if (settings.modules.tasks) {
    navItems.push({
      id: "tasks",
      label: "Tâches",
      icon: <CheckSquare size={18} />,
      isActive: activeTab === "tasks",
      onClick: () => {
        setActiveTab("tasks");
        setActiveSubTab(null);
      },
    });
  }

  if (settings.modules.integration) {
    let subItems = [];
    if (documents && documents.length > 0) {
      subItems = documents.map((doc: any) => ({
        id: doc.id,
        label: doc.title,
        isActive: activeTab === "integration" && activeSubTab === doc.id,
        onClick: () => {
          setActiveTab("integration");
          setActiveSubTab(doc.id);
        },
      }));
    } else {
      subItems = [
        {
          id: "empty",
          label: "Aucun document",
          isActive: activeTab === "integration" && activeSubTab === "empty",
          onClick: () => {
            setActiveTab("integration");
            setActiveSubTab("empty");
          },
        }
      ];
    }

    navItems.push({
      id: "integration",
      label: "Intégration",
      icon: <Settings size={18} />,
      isActive: activeTab === "integration",
      subItems,
    });
  }

  // Always show "Documents" (external links)
  navItems.push({
    id: "raw-docs",
    label: "Documents",
    icon: <FileText size={18} />,
    isActive: activeTab === "raw-docs",
    subItems: [
      {
        id: "drive",
        label: "Dossier Drive GDrive",
        isActive: false,
        onClick: () => {
          window.open("https://drive.google.com", "_blank");
        },
      },
    ],
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar 
        projectName={project.name}
        iconSvg={project.iconSvg}
        items={navItems}
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <header className="flex items-center justify-between border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {activeTab === "tasks" ? "Tâches" : activeTab === "integration" ? "Intégration / Documentation" : "Documents"}
              </h1>
              {activeSubTab && (
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{navItems.find((n: any) => n.id === activeTab)?.subItems?.find((s: any) => s.id === activeSubTab)?.label}</span>
                </p>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
               {isAdmin && (
                 <Link href={`/projects`} title="Retour à l'espace Admin" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs px-3 py-1.5 rounded-md font-semibold tracking-wide border border-primary/20 flex items-center gap-1.5">
                    Mode Admin
                 </Link>
               )}
               <div className="w-8 h-8 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                 {currentUser?.avatarBase64 ? (
                   <img src={currentUser.avatarBase64} alt={currentUser.name} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-xs font-bold text-muted-foreground">
                     {currentUser ? currentUser.name.charAt(0).toUpperCase() : "A"}
                   </span>
                 )}
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + activeSubTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-6"
            >
              {activeTab === "tasks" && !activeSubTab ? (
                <TasksTable 
                  tasks={tasks}
                  allTags={allTags}
                  allUsers={allUsers}
                  allProjects={allProjects}
                  projectUserMap={projectUserMap}
                />
              ) : activeTab === "integration" && activeSubTab !== "empty" && activeSubTab ? (
                <ClientDocumentRenderer document={documents.find((d: any) => d.id === activeSubTab) || documents[0]} />
              ) : (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground shadow-sm">
                  Placeholder pour <strong>{activeTab} {activeSubTab ? `> ${activeSubTab}` : ''}</strong>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
