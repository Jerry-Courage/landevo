import React from "react";
import { Link, useLocation } from "wouter";
import {
  Shield, LayoutDashboard, ShieldCheck, Building2,
  FileText, LogOut, Bell, Settings, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS: { path: string; label: string; icon: React.ElementType; exact?: boolean; badge?: number }[] = [
  { path: "/commission", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/commission/verifications", label: "Agent Verifications", icon: ShieldCheck },
  { path: "/commission/listing-verifications", label: "Listing Verifications", icon: ClipboardList },
  { path: "/commission/listings", label: "Listing Audits", icon: Building2 },
  { path: "/commission/audit", label: "Activity Log", icon: FileText },
  { path: "/commission/settings", label: "Settings", icon: Settings },
];

export default function CommissionLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "LC";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f5]">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 flex flex-col text-white border-r border-white/10 hidden md:flex z-10 shadow-xl"
           style={{ background: "linear-gradient(180deg, #0d2b1f 0%, #133a2a 100%)" }}>
        {/* Header */}
        <div className="h-[72px] flex items-center px-5 gap-3 flex-shrink-0 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-emerald-300" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight text-white">Land Commission</span>
            <span className="text-[10px] text-emerald-300/80 font-semibold tracking-wider">ADMIN PORTAL</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-0.5">
          <div className="px-3 mb-3 text-[10px] font-bold text-white/30 tracking-widest">NAVIGATION</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location === item.path
              : location.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-700/60 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                )}
                style={!isActive ? {} : {}}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </div>
                {item.badge ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white leading-none mb-1 truncate">
                {user?.name ?? "Admin"}
              </span>
              <span className="text-[10px] text-emerald-300/70 leading-none">Commission Admin</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-white/40 hover:text-white hover:bg-white/8 transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground tracking-widest">GHANA LAND COMMISSION — DIGITAL REGISTRY</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
