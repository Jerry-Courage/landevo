import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Settings, ShieldCheck, MapPin, Handshake, ShieldAlert, ArrowRight } from "lucide-react";
import { mockBuyerNotifications } from "@/lib/mock-data";

export default function BuyerNotifications() {
  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Stay updated on your property offers and escrow status.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
              <Check className="w-3 h-3" /> Mark all read
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          {mockBuyerNotifications.map((notif, i) => {
            const isUnread = i < 3;
            
            // Assign icon based on title keywords
            let Icon = ShieldCheck;
            let iconColor = "text-primary";
            let iconBg = "bg-primary/10";
            
            if (notif.title.includes("Offer")) {
              Icon = Handshake;
              iconColor = "text-blue-600";
              iconBg = "bg-blue-100";
            } else if (notif.title.includes("Escrow")) {
              Icon = ShieldAlert;
              iconColor = "text-amber-600";
              iconBg = "bg-amber-100";
            } else if (notif.title.includes("Site Visit")) {
              Icon = MapPin;
              iconColor = "text-purple-600";
              iconBg = "bg-purple-100";
            }

            return (
              <div key={notif.id} className={`p-4 border-b last:border-0 hover:bg-muted/30 transition-colors flex gap-4 ${isUnread ? 'bg-primary/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${iconBg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${isUnread ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                        {notif.title}
                      </h4>
                      {notif.type === "URGENT" && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">URGENT</Badge>}
                      {notif.type === "IMPORTANT" && <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none text-[9px] px-1.5 py-0 h-4">IMPORTANT</Badge>}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-2 ${isUnread ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}>
                    {notif.desc}
                  </p>

                  {notif.link && (
                    <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary hover:text-primary/80 gap-1 mt-1">
                      {notif.link.replace(" →", "")} <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {isUnread && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BuyerLayout>
  );
}
