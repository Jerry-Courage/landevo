import React, { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Activity, Search, CheckCircle2, XCircle, AlertTriangle, Eye, Settings, Landmark, Users, Filter } from "lucide-react";

type ActionType = "All" | "Escrow" | "Agent" | "Listing" | "User" | "System";

const log = [
  { id: "SYS-2001", actor: "System Admin", role: "Super Administrator", action: "Released escrow funds", target: "TXN-8821 — Lekki Phase 1", type: "Escrow", time: "Oct 22, 2023 — 11:15 AM", note: "Commission cleared, documents verified", kind: "release" },
  { id: "SYS-2002", actor: "Commission Officer", role: "Commission Admin", action: "Approved agent credentials", target: "Alex Sterling (AGT-1120)", type: "Agent", time: "Oct 22, 2023 — 10:31 AM", note: "3 documents reviewed", kind: "approve" },
  { id: "SYS-2003", actor: "System Admin", role: "Super Administrator", action: "Flagged escrow dispute", target: "TXN-7720 — Maitama Gardens", type: "Escrow", time: "Oct 21, 2023 — 05:00 PM", note: "Buyer contest filed", kind: "flag" },
  { id: "SYS-2004", actor: "Commission Officer", role: "Commission Admin", action: "Cleared listing audit", target: "LND-7734 — Prime Industrial Zone", type: "Listing", time: "Oct 21, 2023 — 04:48 PM", note: "7 documents verified", kind: "approve" },
  { id: "SYS-2005", actor: "Commission Officer", role: "Commission Admin", action: "Rejected agent credentials", target: "Jonas Eze (AGT-1115)", type: "Agent", time: "Oct 21, 2023 — 02:10 PM", note: "License expired; ID forgery suspected", kind: "reject" },
  { id: "SYS-2006", actor: "System", role: "Automated", action: "Escrow auto-release triggered", target: "TXN-8654 — Emerald Valley", type: "Escrow", time: "Oct 20, 2023 — 12:00 AM", note: "30-day holding period elapsed, all conditions met", kind: "release" },
  { id: "SYS-2007", actor: "System Admin", role: "Super Administrator", action: "Suspended user account", target: "Jonas Eze (USR-0003)", type: "User", time: "Oct 19, 2023 — 03:30 PM", note: "Credential fraud — pending investigation", kind: "reject" },
  { id: "SYS-2008", actor: "System", role: "Automated", action: "Duplicate title reference detected", target: "LND-3392 — Hilltop Acreage", type: "System", time: "Oct 18, 2023 — 12:00 AM", note: "Automated cross-reference check", kind: "flag" },
  { id: "SYS-2009", actor: "System Admin", role: "Super Administrator", action: "Initiated escrow hold", target: "TXN-9104 — Maitama Complex", type: "Escrow", time: "Oct 17, 2023 — 09:00 AM", note: "High-value asset — manual review required", kind: "hold" },
  { id: "SYS-2010", actor: "Commission Officer", role: "Commission Admin", action: "Provisioned new officer", target: "Ngozi Adeyemi (OFF-006)", type: "User", time: "Oct 16, 2023 — 03:00 PM", note: "Lagos State office", kind: "approve" },
  { id: "SYS-2011", actor: "System", role: "Automated", action: "Daily escrow settlement report", target: "Platform-wide", type: "System", time: "Oct 15, 2023 — 12:00 AM", note: "₦ 8.4B under management, 3 pending releases", kind: "system" },
  { id: "SYS-2012", actor: "System Admin", role: "Super Administrator", action: "Released escrow funds", target: "TXN-7502 — Prime Waterfront Plot", type: "Escrow", time: "Oct 14, 2023 — 02:15 PM", note: "All commission and buyer conditions satisfied", kind: "release" },
];

const kindConfig: Record<string, { bg: string; icon: React.ElementType }> = {
  release: { bg: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  approve: { bg: "bg-sky-500/15 text-sky-400", icon: CheckCircle2 },
  reject: { bg: "bg-red-500/15 text-red-400", icon: XCircle },
  flag: { bg: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
  hold: { bg: "bg-indigo-500/15 text-indigo-400", icon: Landmark },
  system: { bg: "bg-white/8 text-white/40", icon: Settings },
};

const typeStyle: Record<string, string> = {
  Escrow: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Agent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Listing: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  User: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  System: "bg-white/8 text-white/35 border-white/10",
};

const tabs: ActionType[] = ["All", "Escrow", "Agent", "Listing", "User", "System"];

export default function AdminActivity() {
  const [tab, setTab] = useState<ActionType>("All");
  const [search, setSearch] = useState("");

  const filtered = log.filter((item) => {
    const matchTab = tab === "All" || item.type === tab;
    const matchSearch = !search ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase()) ||
      item.actor.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>AUDIT TRAIL</p>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Immutable record of all platform actions — escrow, agents, listings, and users.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              placeholder="Search action, target, or actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg text-sm w-72 outline-none focus:ring-1 focus:ring-indigo-500/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-3 py-2 text-xs font-semibold transition-colors"
                style={{ background: tab === t ? "rgba(99,102,241,0.2)" : "transparent", color: tab === t ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}>
                {t}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{filtered.length} records</span>
        </div>

        {/* Log */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {filtered.map((item) => {
              const cfg = kindConfig[item.kind] ?? kindConfig.system;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex items-start gap-4 px-6 py-4 transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.action}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{item.target}</p>
                        {item.note && <p className="text-[11px] mt-1 italic" style={{ color: "rgba(255,255,255,0.3)" }}>{item.note}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeStyle[item.type]}`}>{item.type.toUpperCase()}</span>
                        <p className="text-[11px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.3)" }}>{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                        {item.actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{item.actor}</span>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{item.role}</span>
                      <span className="text-[11px] ml-auto font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{item.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Filter className="w-10 h-10 opacity-20" />
                <p className="text-sm">No log entries match this filter</p>
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Showing {filtered.length} of {log.length} entries</p>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Load more
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
