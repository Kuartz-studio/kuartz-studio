"use client";

import { useState } from "react";
import { CheckSquare, FileText, Link as LinkIcon, Settings } from "lucide-react";
import { ClientSidebar } from "./ClientSidebar";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

type Props = {
  project: {
    id: string;
    name: string;
    slug: string;
    iconSvg: string | null;
    clientPortalToken: string | null;
    portalSettings: any | null; // will be used in step 4
  };
  currentUser: { name: string; avatarBase64: string | null } | null;
  isAdmin: boolean;
};

export function ClientDashboard({ project, currentUser, isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  const settings = project.portalSettings || { modules: { tasks: true, integration: false, branding: false } };

  // Determine which tab should be active by default if the current active tab is hidden
  const navItems = [];

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
    navItems.push({
      id: "integration",
      label: "Intégration",
      icon: <Settings size={18} />,
      isActive: activeTab === "integration",
      subItems: [
        {
          id: "doc1",
          label: "Documentation CMS",
          isActive: activeTab === "integration" && activeSubTab === "doc1",
          onClick: () => {
            setActiveTab("integration");
            setActiveSubTab("doc1");
          },
        },
        {
          id: "doc2",
          label: "Composants",
          isActive: activeTab === "integration" && activeSubTab === "doc2",
          onClick: () => {
            setActiveTab("integration");
            setActiveSubTab("doc2");
          },
        },
      ],
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
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <header className="flex items-center justify-between border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {activeTab === "tasks" ? "Tâches" : activeTab === "integration" ? "Intégration / Documentation" : "Documents"}
              </h1>
              {activeSubTab && (
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{navItems.find(n => n.id === activeTab)?.subItems?.find(s => s.id === activeSubTab)?.label}</span>
                </p>
              )}
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="flex items-center gap-3">
               {isAdmin && (
                 <Link href={`/projects/${project.slug}`} title="Retour à l'espace Admin" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs px-3 py-1.5 rounded-md font-semibold tracking-wide border border-primary/20 flex items-center gap-1.5">
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
              <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground shadow-sm">
                Placeholder pour <strong>{activeTab} {activeSubTab ? `> ${activeSubTab}` : ''}</strong>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
