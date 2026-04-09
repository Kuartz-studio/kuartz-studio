"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {items.map((item) => {
        // Active logic: for root it's exact, for others it's startsWith
        const isActive =
          item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            href={item.path}
            className="relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span
                className="relative z-10 transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-sidebar-foreground)",
                }}
              >
                {item.icon}
              </span>
              <span
                className="relative z-10 transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-sidebar-accent-foreground)"
                    : "var(--color-sidebar-foreground)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
