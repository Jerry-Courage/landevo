import React, { useState } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check, Settings, ShieldCheck, MapPin, Handshake, ShieldAlert, ArrowRight,
  Archive, Search, Filter, BellRing,
} from "lucide-react";
import { mockBuyerNotifications } from "@/lib/mock-data";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread", count: 3 },
  { label: "Offers", value: "offers" },
  { label: "Escrow", value: "escrow" },
  { label: "Site Visits", value: "visits" },
];

function getIconMeta(title: string) {
  if (title.includes("Offer")) return { Icon: Handshake, bg: "bg-blue-600", text: "text-white" };
  if (title.includes("Escrow")) return { Icon: ShieldAlert, bg: "bg-amber-500", text: "text-white" };
  if (title.includes("Site Visit")) return { Icon: MapPin, bg: "bg-purple-600", text: "text-white" };
  if (title.includes("Verification") || title.includes("Verified")) return { Icon: ShieldCheck, bg: "bg-primary", text: "text-primary-foreground" };
  return { Icon: BellRing, bg: "bg-primary", text: "text-primary-foreground" };
}

export default function BuyerNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Stay updated on your property offers and escrow status.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-semibold text-xs">
              <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive All
            </Button>
            <Button variant="outline" size="sm" className="font-semibold text-xs">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Mark all read
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === cat.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {cat.label}
                {cat.count != null && (
                  <Badge className="px-1.5 py-0 text-[10px] bg-primary text-white border-none hover:bg-primary">
                    {cat.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-8 pl-8 pr-3 rounded-md border text-xs bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="icon" className="w-8 h-8"><Filter className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="icon" className="w-8 h-8"><Settings className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {mockBuyerNotifications.map((notif, i) => {
            const isUnread = i < 3;
            const { Icon, bg, text } = getIconMeta(notif.title);

            return (
              <div
                key={notif.id}
                className={`p-5 border-b last:border-0 flex gap-4 transition-colors hover:bg-muted/30 ${isUnread ? "bg-primary/5" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${bg}`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>
                        {notif.title}
                      </h4>
                      {notif.type === "URGENT" && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-none text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold">URGENT</Badge>
                      )}
                      {notif.type === "IMPORTANT" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold">IMPORTANT</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0 whitespace-nowrap">{notif.time}</span>
                  </div>

                  <p className={`text-sm leading-relaxed mb-3 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {notif.desc}
                  </p>

                  {notif.link && (
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
                        {notif.link.replace(" →", "")} <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {isUnread && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-2"></div>
                )}
              </div>
            );
          })}

          <div className="p-4 bg-muted/10 text-center">
            <Button variant="ghost" className="text-xs font-semibold w-full">Load previous notifications</Button>
          </div>
        </div>

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
    </BuyerLayout>
  );
}
