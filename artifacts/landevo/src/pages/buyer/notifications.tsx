import React, { useState } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, MapPin, Handshake, ShieldAlert, ArrowRight, BellRing } from "lucide-react";
import { mockBuyerNotifications } from "@/lib/mock-data";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread", count: 3 },
  { label: "Offers", value: "offers" },
  { label: "Escrow", value: "escrow" },
  { label: "Site Visits", value: "visits" },
];

function getIconMeta(title: string) {
  if (title.includes("Offer")) return { Icon: Handshake, bg: "bg-blue-600" };
  if (title.includes("Escrow")) return { Icon: ShieldAlert, bg: "bg-amber-500" };
  if (title.includes("Site Visit")) return { Icon: MapPin, bg: "bg-purple-600" };
  if (title.includes("Verification") || title.includes("Verified")) return { Icon: ShieldCheck, bg: "bg-primary" };
  return { Icon: BellRing, bg: "bg-primary" };
}

export default function BuyerNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Stay updated on your offers and escrow activity.</p>
          </div>
          <Button variant="outline" size="sm" className="font-semibold text-xs shrink-0">
            <Check className="w-3.5 h-3.5 mr-1.5" /> Mark all read
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 border-b pb-0 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 -mb-px ${
                activeTab === cat.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
              {cat.count != null && (
                <Badge className="px-1.5 py-0 text-[10px] bg-primary text-white border-none hover:bg-primary h-4">
                  {cat.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          {mockBuyerNotifications.map((notif, i) => {
            const isUnread = i < 3;
            const { Icon, bg } = getIconMeta(notif.title);

            return (
              <div
                key={notif.id}
                className={`p-4 border-b last:border-0 flex gap-4 transition-colors hover:bg-muted/30 ${isUnread ? "bg-primary/5" : ""}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm ${isUnread ? "font-bold" : "font-semibold text-foreground/80"}`}>
                        {notif.title}
                      </h4>
                      {notif.type === "URGENT" && (
                        <Badge className="bg-destructive/10 text-destructive border-none text-[9px] px-1.5 py-0 h-4 uppercase font-bold hover:bg-destructive/10">URGENT</Badge>
                      )}
                      {notif.type === "IMPORTANT" && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] px-1.5 py-0 h-4 uppercase font-bold hover:bg-amber-500/10">IMPORTANT</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0">{notif.time}</span>
                  </div>

                  <p className={`text-sm leading-relaxed mb-2 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {notif.desc}
                  </p>

                  {notif.link && (
                    <Button variant="outline" size="sm" className="h-7 text-xs font-semibold gap-1 px-3">
                      {notif.link.replace(" →", "")} <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {isUnread && (
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                )}
              </div>
            );
          })}

          <div className="p-3 bg-muted/10 text-center">
            <Button variant="ghost" className="text-xs font-semibold w-full">Load older notifications</Button>
          </div>
        </div>

      </div>
    </BuyerLayout>
  );
}
