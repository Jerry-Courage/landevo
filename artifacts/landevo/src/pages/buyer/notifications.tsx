import React, { useState } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, MapPin, Handshake, ShieldAlert, ArrowRight, BellRing, Loader2, BellOff } from "lucide-react";
import {
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@workspace/api-client-react";
import type { Notification } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function getIconMeta(type: string) {
  if (type === "offer_received" || type === "offer_accepted" || type === "offer_rejected")
    return { Icon: Handshake, bg: "bg-blue-600" };
  if (type === "transaction_update") return { Icon: ShieldAlert, bg: "bg-amber-500" };
  if (type === "listing_verified" || type === "listing_rejected")
    return { Icon: ShieldCheck, bg: "bg-primary" };
  if (type === "new_message") return { Icon: MapPin, bg: "bg-purple-600" };
  return { Icon: BellRing, bg: "bg-primary" };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function BuyerNotifications() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useListNotifications({
    query: { queryKey: ["/api/notifications", unreadOnly] },
  });
  const { mutate: markAll, isPending: markingAll } = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
    },
  });
  const { mutate: markOne } = useMarkNotificationRead({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.readAt).length;

  const tabs = [
    { label: "All", value: false },
    { label: "Unread", value: true, count: unreadCount },
  ];

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Stay updated on your offers and escrow activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="font-semibold text-xs shrink-0"
              onClick={() => markAll()}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b pb-0">
          {tabs.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => setUnreadOnly(tab.value)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 -mb-px ${
                unreadOnly === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <Badge className="px-1.5 py-0 text-[10px] bg-primary text-white border-none hover:bg-primary h-4">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading notifications…
          </div>
        )}

        {/* Empty */}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadOnly ? "You're all caught up!" : "Activity on your offers and listings will appear here."}
            </p>
          </div>
        )}

        {/* Notification List */}
        {!isLoading && notifications.length > 0 && (
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            {notifications.map((notif: Notification) => {
              const isUnread = !notif.readAt;
              const { Icon, bg } = getIconMeta(notif.type);

              return (
                <div
                  key={notif.id}
                  className={`p-4 border-b last:border-0 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (isUnread) markOne({ id: notif.id });
                  }}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h4
                        className={`text-sm ${
                          isUnread ? "font-bold" : "font-semibold text-foreground/80"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      className={`text-sm leading-relaxed mb-2 ${
                        isUnread ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {notif.body}
                    </p>

                    {notif.relatedId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold gap-1 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {isUnread && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
