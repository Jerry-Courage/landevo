import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Settings, Archive, Check, BellRing, MessageSquare, ShieldCheck, Tag, FileSignature, Loader2 } from "lucide-react";
import {
  useListNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import type { Notification } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/format";

function getIcon(type: string) {
  if (type === "new_message") return <MessageSquare className="w-4 h-4 text-white" />;
  if (type === "listing_verified") return <ShieldCheck className="w-4 h-4 text-white" />;
  if (type === "offer_received" || type === "offer_accepted" || type === "offer_rejected") return <Tag className="w-4 h-4 text-white" />;
  if (type === "transaction_update") return <FileSignature className="w-4 h-4 text-white" />;
  return <BellRing className="w-4 h-4 text-white" />;
}

function getIconBg(type: string) {
  if (type === "offer_accepted" || type === "listing_verified") return "bg-green-600";
  if (type === "offer_rejected" || type === "listing_rejected") return "bg-destructive";
  if (type === "transaction_update") return "bg-amber-500";
  return "bg-primary";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  return formatDate(dateStr);
}

type FilterType = "all" | "unread" | "transaction_update" | "new_message";

export default function Notifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const { data: notifications = [], isLoading } = useListNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkRead = (notif: Notification) => {
    if (notif.readAt) return;
    markRead(
      { notificationId: notif.id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) }
    );
  };

  const handleMarkAllRead = () => {
    markAllRead(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread" && n.readAt) return false;
    if (filter === "transaction_update" && n.type !== "transaction_update") return false;
    if (filter === "new_message" && n.type !== "new_message") return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications Center</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your listing updates, transaction alerts, and client messages.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-semibold text-xs"><Archive className="w-3.5 h-3.5 mr-1.5" /> Archive All</Button>
            <Button
              variant="outline"
              size="sm"
              className="font-semibold text-xs"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || unreadCount === 0}
            >
              {isMarkingAll ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <Button
              variant="ghost"
              className={`rounded-full px-4 h-8 text-xs font-semibold ${filter === "all" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap ${filter === "unread" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-primary text-white border-none">{unreadCount}</Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap ${filter === "transaction_update" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setFilter("transaction_update")}
            >
              Transactions
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap ${filter === "new_message" ? "bg-muted" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setFilter("new_message")}
            >
              Messages
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-md border text-xs bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="icon" className="w-8 h-8"><Filter className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="icon" className="w-8 h-8"><Settings className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Notification List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-lg shadow-sm p-12 text-center">
            <BellRing className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No notifications found.</p>
          </div>
        ) : (
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
            {filtered.map((notif) => {
              const isUnread = !notif.readAt;
              return (
                <div
                  key={notif.id}
                  className={`p-5 border-b last:border-0 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer ${isUnread ? 'bg-primary/5' : ''}`}
                  onClick={() => handleMarkRead(notif)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm ${isUnread ? 'font-bold' : 'font-semibold'}`}>{notif.title}</h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0 whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {notif.body}
                    </p>
                  </div>
                </div>
              );
            })}
            
            <div className="p-4 bg-muted/10 text-center">
              <Button variant="ghost" className="text-xs font-semibold w-full">Load previous notifications</Button>
            </div>
          </div>
        )}

        {/* Settings Teaser */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm">Notification Settings</h4>
            <p className="text-xs text-muted-foreground mt-1">Control how and when you receive alerts from Landevo.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Email Alerts</span>
              <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Push Notifications</span>
              <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
