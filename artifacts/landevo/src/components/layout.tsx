import React from "react";
import { Link, useLocation } from "wouter";
import { Compass, LayoutDashboard, Store, ArrowRightLeft, MessageSquare, Settings, Bell, Search, LogOut, HandCoins, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/marketplace", label: "Marketplace", icon: Store },
  { path: "/offers", label: "Offers", icon: HandCoins },
  { path: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { path: "/messages", label: "Messages", icon: MessageSquare },
  { path: "/kyc", label: "Get Verified", icon: ShieldCheck },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleLabel =
    user?.role === "commission_admin"
      ? "Commission Admin"
      : user?.role === "agent"
      ? "Agent Account"
      : "Account";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-[200px] flex-shrink-0 bg-sidebar flex flex-col text-sidebar-foreground border-r border-sidebar-border hidden md:flex z-10 shadow-xl">
        <div className="h-16 flex items-center px-6 gap-3 flex-shrink-0 border-b border-sidebar-border/30">
          <Compass className="w-6 h-6 text-primary-foreground" />
          <span className="font-bold text-lg tracking-tight">Landevo</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 tracking-wider">MAIN MENU</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (location.startsWith(item.path) && item.path !== "/");
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

        <div className="p-4 border-t border-sidebar-border/30 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center font-bold text-xs text-primary-foreground flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none mb-1 truncate">{user?.name ?? "—"}</span>
              <span className="text-[10px] text-sidebar-foreground/60 leading-none">{roleLabel}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-4 flex-shrink-0 bg-card/50">
          <div className="flex-1 flex items-center gap-3 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search listings, transactions..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/notifications">
              <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground">
              {initials}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
