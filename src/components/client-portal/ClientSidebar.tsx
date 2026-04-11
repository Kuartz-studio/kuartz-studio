"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, FileText, CheckSquare, Settings, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  subItems?: { id: string; label: string; isActive?: boolean; onClick?: () => void }[];
};

type Props = {
  projectName: string;
  logoBase64: string | null;
  items: NavItem[];
};

export function ClientSidebar({ projectName, logoBase64, items }: Props) {
  // Garder trace des menus déroulants ouverts
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 border-r bg-card/50 flex flex-col shrink-0 overflow-y-auto">
      {/* Header Logo & Nom du Projet */}
      <div className="h-16 px-4 flex items-center gap-3 border-b shrink-0">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-foreground bg-transparent rounded-md overflow-hidden border shadow-sm">
          {logoBase64 ? (
            <img src={logoBase64} alt={projectName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-lg tracking-tight bg-sidebar-foreground text-background w-full h-full flex items-center justify-center">{projectName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="font-bold tracking-tight truncate flex-1">{projectName}</span>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="p-3 flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <button
              onClick={() => {
                if (item.subItems) {
                  toggleMenu(item.id);
                }
                item.onClick?.();
              }}
              className={`
                flex items-center justify-between w-full p-2 rounded-md text-sm font-medium transition-colors
                ${item.isActive || openMenus[item.id] 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">{item.icon}</div>
                <span>{item.label}</span>
              </div>
              {item.subItems && (
                <div className="shrink-0">
                  {openMenus[item.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </button>

            {/* Sub-items (Nested Menu) */}
            <AnimatePresence initial={false}>
              {item.subItems && openMenus[item.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 pl-9 mt-1 relative before:absolute before:left-[17px] before:top-0 before:bottom-2 before:w-px before:bg-border">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => sub.onClick?.()}
                        className={`
                          text-left py-1.5 px-2 rounded-md text-sm transition-colors relative
                          before:absolute before:left-[-19px] before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-px before:bg-border
                          ${sub.isActive ? "font-medium text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}
                        `}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
}
