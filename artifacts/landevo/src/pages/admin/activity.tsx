import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin-layout";
import { Activity, Search, CheckCircle2, XCircle, AlertTriangle, Settings, Landmark, Filter } from "lucide-react";

type ActionType = "All" | "Escrow" | "Agent" | "Listing" | "User" | "System";

interface LogEntry {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  type: string;
  time: string;
  note: string;
  kind: string;
}

const kindConfig: Record<string, { bg: string; icon: React.ElementType }> = {
  release: { bg: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  approve: { bg: "bg-sky-500/15 text-sky-400", icon: CheckCircle2 },
  reject:  { bg: "bg-red-500/15 text-red-400", icon: XCircle },
  flag:    { bg: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
  hold:    { bg: "bg-indigo-500/15 text-indigo-400", icon: Landmark },
  system:  { bg: "bg-white/8 text-white/40", icon: Settings },
};

const typeStyle: Record<string, string> = {
  Escrow:  "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Agent:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Listing: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  User:    "bg-violet-500/15 text-violet-400 border-violet-500/20",
  System:  "bg-white/8 text-white/35 border-white/10",
};

const tabs: ActionType[] = ["All", "Escrow", "Agent", "Listing", "User", "System"];

export default function AdminActivity() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ActionType>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/activity-logs")
      .then(r => r.ok ? r.json() : [])
      .then(setLog)
      .catch(() => setLog([]))
      .finally(() => setLoading(false));
  }, []);

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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input placeholder="Search action, target, or actor..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg text-sm w-72 outline-none focus:ring-1 focus:ring-indigo-500/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold transition-colors"
                style={{ background: tab === t ? "rgba(99,102,241,0.2)" : "transparent", color: tab === t ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}>
                {t}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{filtered.length} records</span>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {loading && (
              <div className="py-16 flex items-center justify-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading activity log…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Filter className="w-10 h-10 opacity-20" />
                <p className="text-sm">{log.length === 0 ? "No activity recorded yet — actions will appear here as admins make changes" : "No log entries match this filter"}</p>
              </div>
            )}
            {!loading && filtered.map((item) => {
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
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeStyle[item.type] ?? typeStyle.System}`}>{item.type.toUpperCase()}</span>
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
          </div>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Showing {filtered.length} of {log.length} entries</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
