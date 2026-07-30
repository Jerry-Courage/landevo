import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Landmark, Users, ArrowRightLeft,
  ShieldAlert, LogOut, Bell, Activity, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/escrow", label: "Escrow Control", icon: Landmark },
  { path: "/admin/users", label: "All Users", icon: Users },
  { path: "/admin/transactions", label: "Transactions", icon: ArrowRightLeft },
  { path: "/admin/activity", label: "Activity Log", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "SA";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0f1117" }}>
      {/* Sidebar */}
      <div
        className="w-[220px] flex-shrink-0 flex flex-col hidden md:flex z-10"
        style={{ background: "#13161f", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 gap-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">Landevo</p>
            <p className="text-[10px] font-bold text-indigo-400 tracking-widest mt-0.5">SYSTEM ADMIN</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>CONTROL PANEL</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location === item.path
              : location.startsWith(item.path) && location !== "/admin" || (item.exact && location === item.path);
            const active = item.exact ? location === item.path : location.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white leading-none mb-1 truncate">{user?.name ?? "System Admin"}</span>
              <span className="text-[10px] text-indigo-400/80 leading-none font-semibold">Super Administrator</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium w-full transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div
          className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: "#13161f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-[11px] font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            LANDEVO SYSTEM ADMINISTRATION — RESTRICTED ACCESS
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-green-400">ALL SYSTEMS NOMINAL</span>
            </div>
            <button className="relative p-2 rounded-md transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs text-white">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#0f1117" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
