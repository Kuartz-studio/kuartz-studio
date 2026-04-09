"use client";

import { useState, useTransition } from "react";
import { markNotificationReadAction, markAllReadAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  linkTo: string | null;
  read: boolean;
  createdAt: Date | null;
};

function timeAgo(date: Date | null) {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export function NotificationBell({ notifications, unreadCount }: { notifications: Notification[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const [localUnread, setLocalUnread] = useState(unreadCount);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setLocalUnread(prev => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllReadAction();
      setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setLocalUnread(0);
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell size={18} />
        {localUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {localUnread > 9 ? "9+" : localUnread}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-card border rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-semibold">Notifications</span>
              {localUnread > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={handleMarkAllRead} disabled={isPending}>
                  <CheckCheck size={12} /> Tout lire
                </Button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {localNotifs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-8">Aucune notification.</p>
              ) : (
                localNotifs.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? "font-medium" : "text-muted-foreground"}`}>
                        {notif.message}
                      </p>
                      <span className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <div className="flex items-start gap-1 flex-shrink-0">
                      {notif.linkTo && (
                        <Link href={notif.linkTo} onClick={() => { setOpen(false); if (!notif.read) handleMarkRead(notif.id); }}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink size={12} />
                          </Button>
                        </Link>
                      )}
                      {!notif.read && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMarkRead(notif.id)} disabled={isPending}>
                          <Check size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
