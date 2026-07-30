import React from "react";
import { Link, useLocation } from "wouter";
import { Compass, LayoutDashboard, Search as SearchIcon, Heart, ShieldCheck, MessageSquare, Bell, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/buyer", label: "Home", icon: LayoutDashboard },
  { path: "/buyer/browse", label: "Browse Properties", icon: SearchIcon },
  { path: "/buyer/offers", label: "My Offers", icon: Heart },
  { path: "/buyer/escrow", label: "Escrow Tracker", icon: ShieldCheck },
  { path: "/buyer/messages", label: "Messages", icon: MessageSquare },
  { path: "/buyer/notifications", label: "Notifications", icon: Bell },
  { path: "/buyer/settings", label: "Settings", icon: Settings },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-[200px] flex-shrink-0 bg-sidebar flex flex-col text-sidebar-foreground border-r border-sidebar-border hidden md:flex z-10 shadow-xl">
        <div className="h-16 flex items-center px-6 gap-3 flex-shrink-0 border-b border-sidebar-border/30">
          <Compass className="w-6 h-6 text-sidebar-foreground" />
          <span className="font-bold text-lg tracking-tight">Landevo</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 tracking-wider">BUYER PORTAL</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (location.startsWith(item.path + "/") && item.path !== "/buyer");
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border/30">
          <Link href="/buyer/settings" className="flex items-center gap-3 hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center font-bold text-xs text-sidebar-foreground relative">
              BM
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none mb-1">Babatunde M.</span>
              <span className="text-[10px] text-sidebar-foreground/60 leading-none">Verified Buyer</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <span className="capitalize">{location.split('/')[2] || 'Home'}</span>
          </div>

          <div className="flex items-center justify-center max-w-md w-full mx-4">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search verified properties..." 
                className="w-full h-9 pl-9 pr-4 rounded-md border bg-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs font-semibold text-primary hover:underline whitespace-nowrap">
              Switch to Agent View →
            </Link>
            <Link href="/buyer/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-card"></span>
            </Link>
            <div className="h-8 w-px bg-border mx-1"></div>
            <Link href="/buyer/settings" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground relative">
                BM
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
