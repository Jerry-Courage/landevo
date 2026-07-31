import React, { useState } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldCheck, ShieldX, Clock, Search, CheckCircle2,
  XCircle, Eye, FileText, AlertCircle, Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { useListVerifications, useApproveVerification, useRejectVerification } from "@workspace/api-client-react";

type FilterStatus = "All" | "Pending Review" | "Under Review" | "Approved" | "Rejected";

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "Pending Review": { bg: "bg-amber-100 text-amber-800",  text: "PENDING",      icon: Clock },
  "Under Review":   { bg: "bg-blue-100 text-blue-800",    text: "UNDER REVIEW", icon: Eye },
  "Approved":       { bg: "bg-emerald-100 text-emerald-800", text: "APPROVED",  icon: CheckCircle2 },
  "Rejected":       { bg: "bg-red-100 text-red-800",       text: "REJECTED",    icon: XCircle },
};

const tabs: FilterStatus[] = ["All", "Pending Review", "Under Review", "Approved", "Rejected"];

function apiToUiStatus(s: string): FilterStatus {
  switch (s) {
    case "pending":   return "Pending Review";
    case "in_review": return "Under Review";
    case "approved":  return "Approved";
    case "rejected":  return "Rejected";
    default:          return "Pending Review";
  }
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function CommissionVerifications() {
  const [activeTab, setActiveTab] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const { data: rawList = [], refetch } = useListVerifications();
  const approve = useApproveVerification();
  const reject  = useRejectVerification();

  const verifications = rawList.map((v) => ({
    ...v,
    uiStatus: apiToUiStatus(v.status),
  }));

  const filtered = verifications.filter((v) => {
    const matchesTab = activeTab === "All" || v.uiStatus === activeTab;
    const matchesSearch = !search ||
      v.agentName.toLowerCase().includes(search.toLowerCase()) ||
      v.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
      String(v.id).includes(search);
    return matchesTab && matchesSearch;
  });

  const selectedVerif = verifications.find((v) => v.id === selected);

  async function handleApprove(id: number) {
    await approve.mutateAsync({ verificationId: id, data: { notes: "Approved by officer" } });
    refetch();
    setSelected(null);
  }

  async function handleReject(id: number) {
    await reject.mutateAsync({ verificationId: id, data: { notes: "Rejected by officer" } });
    refetch();
    setSelected(null);
  }

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">LISTING VERIFICATION</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Listing Verifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review agent-submitted listings before they go live on the platform.</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {tabs.slice(1).map((s) => {
            const count = verifications.filter(v => v.uiStatus === s).length;
            const colorMap: Record<string, string> = {
              "Pending Review": "border-l-amber-400",
              "Under Review":   "border-l-blue-400",
              "Approved":       "border-l-emerald-500",
              "Rejected":       "border-l-red-400",
            };
            return (
              <Card key={s} className={`bg-white shadow-sm border-l-4 ${colorMap[s]}`}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.toUpperCase()}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-6">
          {/* Main table */}
          <div className={`flex flex-col gap-4 ${selectedVerif ? "flex-1" : "w-full"}`}>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search listing or agent..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex border border-border rounded-lg bg-white overflow-hidden">
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">LISTING</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">AGENT</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">OFFICER</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((v) => {
                      const cfg = statusConfig[v.uiStatus];
                      const Icon = cfg.icon;
                      const isSelected = selected === v.id;
                      return (
                        <TableRow
                          key={v.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/40" : "hover:bg-muted/20"}`}
                          onClick={() => setSelected(isSelected ? null : v.id)}
                        >
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <div>
                                <span className="font-semibold text-sm">{v.listingTitle}</span>
                                <p className="text-[11px] text-muted-foreground font-mono">VER-{v.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{v.agentName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{v.officerName ?? <span className="italic text-muted-foreground/50">Unassigned</span>}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmt(v.submittedAt)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg}`}>
                              <Icon className="w-3 h-3" />{cfg.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            {(v.uiStatus === "Pending Review" || v.uiStatus === "Under Review") && (
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(v.id)} disabled={reject.isPending}>
                                  Reject
                                </Button>
                                <Button size="sm" className="h-7 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800" onClick={() => handleApprove(v.id)} disabled={approve.isPending}>
                                  Approve
                                </Button>
                              </div>
                            )}
                            {v.uiStatus === "Approved" && <span className="text-xs text-emerald-700 font-semibold">✓ Cleared</span>}
                            {v.uiStatus === "Rejected" && <span className="text-xs text-red-600 font-semibold">✗ Rejected</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <ShieldCheck className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">No verifications match this filter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail panel */}
          {selectedVerif && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 flex-shrink-0">
              <Card className="bg-white shadow-sm sticky top-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedVerif.listingTitle}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">VER-{selectedVerif.id}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3 text-sm">
                    {[
                      ["Agent",     selectedVerif.agentName],
                      ["Officer",   selectedVerif.officerName ?? "Unassigned"],
                      ["Status",    selectedVerif.uiStatus],
                      ["Submitted", fmt(selectedVerif.submittedAt)],
                      ["Reviewed",  fmt(selectedVerif.reviewedAt)],
                      ["Notes",     selectedVerif.notes ?? "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground text-xs font-semibold">{label}</span>
                        <span className="text-xs text-right font-medium max-w-[160px]">{value as string}</span>
                      </div>
                    ))}
                  </div>

                  {(selectedVerif.uiStatus === "Pending Review" || selectedVerif.uiStatus === "Under Review") && (
                    <div className="border-t pt-3 space-y-2">
                      <Button className="w-full h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-sm" onClick={() => handleApprove(selectedVerif.id)} disabled={approve.isPending}>
                        <ShieldCheck className="w-4 h-4 mr-2" /> Approve Listing
                      </Button>
                      <Button variant="outline" className="w-full h-9 font-semibold text-sm text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(selectedVerif.id)} disabled={reject.isPending}>
                        <ShieldX className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </CommissionLayout>
  );
}
