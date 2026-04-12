"use client";

import { useState } from "react";
import { CheckSquare, FileText, Link as LinkIcon, Settings, Globe, Layers, Palette, PenTool, Type } from "lucide-react";
import { FramerIcon } from "@/components/icons";
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
    logoBase64: string | null;
    clientPortalToken: string | null;
    portalSettings: any | null;
  };
  currentUser: { id: string; name: string; avatarBase64: string | null; email: string } | null;
  isAdmin: boolean;
  tasks: any[];
  documents: any[];
  files?: any[];
  allTags: any[];
  allUsers: any[];
  allProjects: any[];
  projectUserMap: Record<string, string[]>;
};

export function ClientDashboard({ project, currentUser, isAdmin, tasks, documents, files = [], allTags, allUsers, allProjects, projectUserMap }: Props) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  const settings = project.portalSettings || { modules: { tasks: true, integration: false, branding: false, files: true } };

  const navItems: any[] = [];

  if (settings.modules.tasks !== false) {
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

  if (documents && documents.length > 0) {
    const docsByCategory = documents.reduce((acc, doc) => {
      const cat = doc.category || "Autre";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    (Object.entries(docsByCategory) as [string, any[]][]).forEach(([cat, catDocs]) => {
      if (settings.modules[cat] === false) return; // Hidden by settings

      let IconComponent: any = Settings;
      if (cat === "Framer") IconComponent = FramerIcon;
      else if (cat === "Webflow") IconComponent = Globe;
      else if (cat === "Figma") IconComponent = Layers;
      else if (cat === "Branding") IconComponent = Palette;
      else if (cat === "Design") IconComponent = PenTool;
      else if (cat === "Copywriting") IconComponent = Type;

      navItems.push({
        id: `cat-${cat}`,
        label: cat,
        icon: <IconComponent size={18} />,
        isActive: activeTab === `cat-${cat}`,
        subItems: catDocs.map(doc => ({
          id: doc.id,
          label: doc.title,
          isActive: activeTab === `cat-${cat}` && activeSubTab === doc.id,
          onClick: () => {
            setActiveTab(`cat-${cat}`);
            setActiveSubTab(doc.id);
          }
        }))
      });
    });
  }

  if (settings.modules.files !== false && files && files.length > 0) {
    let subItems = files.map((file: any) => ({
      id: file.id,
      label: file.title,
      isActive: false, // We just open in new tab
      onClick: () => {
        window.open(file.url, "_blank");
      },
    }));

    navItems.push({
      id: "raw-docs",
      label: "Documents",
      icon: <FileText size={18} />,
      isActive: activeTab === "raw-docs",
      subItems,
    });
  }

  // Ensure active tab defaults to something available if it was hidden
  if (activeTab !== "tasks" && activeTab !== "raw-docs" && !activeTab.startsWith("cat-")) {
    setActiveTab("tasks");
  } else if (activeTab === "raw-docs" && (!files || files.length === 0)) {
    setActiveTab("tasks");
  }
  
  const currentTabLabel = navItems.find((n: any) => n.id === activeTab)?.label || "Tâches";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar 
        projectName={project.name}
        projectSlug={project.slug}
        logoBase64={project.logoBase64}
        items={navItems}
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <header className="flex items-center justify-between border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentTabLabel}
              </h1>
              {activeSubTab && (
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{navItems.find((n: any) => n.id === activeTab)?.subItems?.find((s: any) => s.id === activeSubTab)?.label}</span>
                </p>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
               {/* Mode Admin button removed */}
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
              ) : activeTab.startsWith("cat-") && activeSubTab ? (
                <ClientDocumentRenderer document={documents.find((d: any) => d.id === activeSubTab)} />
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
