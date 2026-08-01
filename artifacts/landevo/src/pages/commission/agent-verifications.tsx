import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  UserCheck, Clock, Search, CheckCircle2, XCircle, Eye, ChevronRight, UserX,
} from "lucide-react";

type FilterStatus = "All" | "Pending" | "Under Review" | "Approved" | "Rejected";

interface AgentVerifRow {
  id: number;
  agentId: number;
  agentName: string;
  agentEmail: string;
  officerName: string | null;
  status: "pending" | "in_review" | "approved" | "rejected";
  governmentIdType: string;
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  agentIsVerified: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending:   { bg: "bg-amber-100 text-amber-800",     text: "PENDING",      icon: Clock },
  in_review: { bg: "bg-blue-100 text-blue-800",       text: "UNDER REVIEW", icon: Eye },
  approved:  { bg: "bg-emerald-100 text-emerald-800", text: "APPROVED",     icon: CheckCircle2 },
  rejected:  { bg: "bg-red-100 text-red-800",         text: "REJECTED",     icon: XCircle },
};

const tabs: FilterStatus[] = ["All", "Pending", "Under Review", "Approved", "Rejected"];

function apiToUi(s: string): FilterStatus {
  switch (s) {
    case "pending":   return "Pending";
    case "in_review": return "Under Review";
    case "approved":  return "Approved";
    case "rejected":  return "Rejected";
    default:          return "Pending";
  }
}

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" });
}

export default function AgentVerifications() {
  const [, navigate] = useLocation();
  const [rows, setRows] = useState<AgentVerifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      const res = await fetch("/api/agent-verifications", { credentials: "include" });
      if (res.ok) setRows(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const withUiStatus = rows.map(r => ({ ...r, uiStatus: apiToUi(r.status) }));

  const filtered = withUiStatus.filter(r => {
    const matchTab = activeTab === "All" || r.uiStatus === activeTab;
    const matchSearch = !search ||
      r.agentName.toLowerCase().includes(search.toLowerCase()) ||
      r.agentEmail.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search);
    return matchTab && matchSearch;
  });

  const countOf = (s: FilterStatus) => withUiStatus.filter(r => r.uiStatus === s).length;

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">AGENT IDENTITY VERIFICATION</p>
          <h1 className="text-2xl font-bold tracking-tight">Agent Verifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review agent-submitted KYC documents before granting them a verified badge.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {(["Pending", "Under Review", "Approved", "Rejected"] as FilterStatus[]).map((s) => {
            const colorMap: Record<string, string> = {
              "Pending":      "border-l-amber-400",
              "Under Review": "border-l-blue-400",
              "Approved":     "border-l-emerald-500",
              "Rejected":     "border-l-red-400",
            };
            return (
              <Card key={s} className={`bg-white shadow-sm border-l-4 ${colorMap[s]}`}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.toUpperCase()}</p>
                  <p className="text-2xl font-bold mt-1">{countOf(s)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agent name or email..."
              className="pl-9 h-9 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex border border-border rounded-lg bg-white overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">AGENT</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">ID TYPE</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">OFFICER</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const cfg = statusConfig[r.status];
                    const Icon = cfg.icon;
                    return (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => navigate(`/commission/verifications/${r.id}`)}
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-800 flex-shrink-0">
                              {r.agentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm">{r.agentName}</span>
                                {r.agentIsVerified && (
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" title="Already verified" />
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">{r.agentEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.governmentIdType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fmt(r.submittedAt)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.officerName ?? <span className="italic text-muted-foreground/50">Unassigned</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg}`}>
                            <Icon className="w-3 h-3" />{cfg.text}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <UserX className="w-10 h-10 opacity-20" />
                <p className="text-sm font-medium">No agent verifications match this filter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CommissionLayout>
  );
}
