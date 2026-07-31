import React, { useState, useEffect } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, CheckCircle2, XCircle, AlertTriangle, Eye, Settings, Filter } from "lucide-react";

type ActionType = "All" | "Approve" | "Reject" | "Flag" | "Review" | "System";

interface AuditEntry {
  id: string;
  officer: string;
  role: string;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
  type: string;
  ref: string;
}

const actionConfig: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
  Approve: { bg: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "APPROVED" },
  Reject:  { bg: "bg-red-100 text-red-700",         icon: XCircle,      label: "REJECTED" },
  Flag:    { bg: "bg-amber-100 text-amber-700",     icon: AlertTriangle,label: "FLAGGED" },
  Review:  { bg: "bg-blue-100 text-blue-700",       icon: Eye,          label: "REVIEW" },
  System:  { bg: "bg-gray-100 text-gray-600",       icon: Settings,     label: "SYSTEM" },
};

const tabs: ActionType[] = ["All", "Approve", "Reject", "Flag", "Review", "System"];

export default function CommissionAudit() {
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActionType>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/commission/audit")
      .then(r => r.ok ? r.json() : [])
      .then(setLog)
      .catch(() => setLog([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = log.filter((item) => {
    const matchesTab = activeTab === "All" || item.type === activeTab;
    const matchesSearch = !search ||
      item.officer.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">TRANSPARENCY & ACCOUNTABILITY</p>
            <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground mt-1 text-sm">Complete record of all commission admin actions across agents and listings.</p>
          </div>
          <Button variant="outline" className="bg-white font-semibold h-9">
            <Download className="w-4 h-4 mr-2" /> Export Log
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search admin, action, target..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex border border-border rounded-lg bg-white overflow-hidden">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">{filtered.length} records</span>
        </div>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {loading && (
                <div className="py-16 flex items-center justify-center text-sm text-muted-foreground">Loading activity log…</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <Filter className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">{log.length === 0 ? "No admin activity recorded yet" : "No entries match this filter"}</p>
                </div>
              )}
              {!loading && filtered.map((item) => {
                const cfg = actionConfig[item.type] ?? actionConfig.System;
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground/80">{item.target}</span></p>
                          {item.ref && <p className="text-[11px] text-muted-foreground/70 italic mt-1">{item.ref}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                          <p className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">{item.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-slate-600">
                            {item.officer.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">{item.officer}</span>
                        <span className="text-[11px] text-muted-foreground/50">·</span>
                        <span className="text-[11px] text-muted-foreground/70">{item.role}</span>
                        <span className="text-[11px] text-muted-foreground/40 ml-auto font-mono">{item.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {filtered.length} of {log.length} entries</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommissionLayout>
  );
}
