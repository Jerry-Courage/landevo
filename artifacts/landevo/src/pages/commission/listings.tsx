import React, { useState, useEffect, useCallback } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Search, Download, CheckCircle2, XCircle, Clock, Eye, AlertTriangle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

type AuditStatus = "All" | "Awaiting Audit" | "Under Review" | "Approved" | "Correction Required";
type FilterStatus = Exclude<AuditStatus, "All">;

interface AuditListing {
  id: string;
  verificationId: number;
  listingId: number;
  name: string;
  location: string;
  agent: string;
  agentId: string;
  type: string;
  size: string;
  value: number;
  submitted: string;
  status: string;
  notes: string;
}

const statusConfig: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  "Awaiting Audit":      { bg: "bg-amber-100 text-amber-800",   label: "AWAITING",    icon: Clock },
  "Under Review":        { bg: "bg-blue-100 text-blue-800",     label: "REVIEWING",   icon: Eye },
  "Approved":            { bg: "bg-emerald-100 text-emerald-800",label: "APPROVED",    icon: CheckCircle2 },
  "Correction Required": { bg: "bg-red-100 text-red-800",       label: "CORRECTION",  icon: AlertTriangle },
};

const tabs: AuditStatus[] = ["All", "Awaiting Audit", "Under Review", "Approved", "Correction Required"];

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

export default function CommissionListings() {
  const [listings, setListings] = useState<AuditListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AuditStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/commission/listings");
      if (res.ok) setListings(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleApprove = async (verificationId: number, listingId: string) => {
    setActionPending(listingId);
    try {
      await fetch(`/api/verifications/${verificationId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by commission officer" }),
      });
      await fetchListings();
      setSelected(null);
    } finally { setActionPending(null); }
  };

  const handleFlag = async (verificationId: number, listingId: string) => {
    setActionPending(listingId);
    try {
      await fetch(`/api/verifications/${verificationId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Flagged for correction by commission officer" }),
      });
      await fetchListings();
      setSelected(null);
    } finally { setActionPending(null); }
  };

  const filtered = listings.filter((l) => {
    const matchesTab = activeTab === "All" || l.status === activeTab;
    const matchesSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.agent.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedListing = listings.find((l) => l.id === selected);

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">PROPERTY AUDITING</p>
            <h1 className="text-2xl font-bold tracking-tight">Listing Audits</h1>
            <p className="text-muted-foreground mt-1 text-sm">Verify property documents and approve listings for publication.</p>
          </div>
          <Button variant="outline" className="bg-white font-semibold h-9">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(tabs.slice(1) as FilterStatus[]).map((s) => {
            const count = listings.filter((l) => l.status === s).length;
            const colors: Record<FilterStatus, string> = {
              "Awaiting Audit":      "border-l-amber-400",
              "Under Review":        "border-l-blue-400",
              "Approved":            "border-l-emerald-500",
              "Correction Required": "border-l-red-400",
            };
            return (
              <Card key={s} className={`bg-white shadow-sm border-l-4 ${colors[s] ?? ""} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setActiveTab(s)}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.toUpperCase()}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-6">
          <div className={`flex flex-col gap-4 ${selectedListing ? "flex-1" : "w-full"}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search listing ID, name or agent..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                {loading ? (
                  <div className="py-16 flex items-center justify-center text-sm text-muted-foreground">Loading listing audits…</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">LISTING</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">TYPE</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">AGENT</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right">VALUE</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((listing) => {
                        const cfg = statusConfig[listing.status] ?? statusConfig["Awaiting Audit"];
                        const Icon = cfg.icon;
                        const isSelected = selected === listing.id;
                        return (
                          <TableRow key={listing.id}
                            className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/40" : "hover:bg-muted/20"}`}
                            onClick={() => setSelected(isSelected ? null : listing.id)}>
                            <TableCell className="pl-5">
                              <div>
                                <span className="font-semibold text-sm block">{listing.name}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[11px] text-muted-foreground">{listing.location}</span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground/60">{listing.id}</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="text-xs font-semibold">{listing.type}</Badge></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.agent}</TableCell>
                            <TableCell className="text-sm font-bold text-right">{formatCurrency(listing.value)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.submitted}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg}`}>
                                <Icon className="w-3 h-3" />{cfg.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                              {(listing.status === "Awaiting Audit" || listing.status === "Under Review") && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button size="sm" variant="outline"
                                    className="h-7 text-xs font-semibold text-amber-600 border-amber-200 hover:bg-amber-50"
                                    disabled={actionPending === listing.id}
                                    onClick={() => handleFlag(listing.verificationId, listing.id)}>Flag</Button>
                                  <Button size="sm"
                                    className="h-7 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800"
                                    disabled={actionPending === listing.id}
                                    onClick={() => handleApprove(listing.verificationId, listing.id)}>Approve</Button>
                                </div>
                              )}
                              {listing.status === "Correction Required" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">Re-audit</Button>
                              )}
                              {listing.status === "Approved" && <span className="text-xs text-emerald-700 font-semibold">✓ Published</span>}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <Building2 className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">{listings.length === 0 ? "No listing audits yet — agents must submit listings for verification" : "No listings match this filter"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedListing && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 flex-shrink-0">
              <Card className="bg-white shadow-sm sticky top-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm leading-tight">{selectedListing.name}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedListing.id}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    {([
                      ["Location", selectedListing.location],
                      ["Type", selectedListing.type],
                      ["Size", selectedListing.size],
                      ["Value", formatCurrency(selectedListing.value)],
                      ["Agent", `${selectedListing.agent} (${selectedListing.agentId})`],
                      ["Submitted", selectedListing.submitted],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                        <span className="text-xs text-right font-medium max-w-[160px]">{value}</span>
                      </div>
                    ))}
                  </div>
                  {selectedListing.notes && (
                    <div className="border-t pt-3">
                      <p className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">OFFICER NOTES</p>
                      <p className="text-xs text-foreground leading-relaxed bg-muted/30 rounded-md p-3">{selectedListing.notes}</p>
                    </div>
                  )}
                  {(selectedListing.status === "Awaiting Audit" || selectedListing.status === "Under Review") && (
                    <div className="border-t pt-3 space-y-2">
                      <Button className="w-full h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-sm"
                        disabled={actionPending === selectedListing.id}
                        onClick={() => handleApprove(selectedListing.verificationId, selectedListing.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Publish
                      </Button>
                      <Button variant="outline" className="w-full h-9 font-semibold text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
                        disabled={actionPending === selectedListing.id}
                        onClick={() => handleFlag(selectedListing.verificationId, selectedListing.id)}>
                        <AlertTriangle className="w-4 h-4 mr-2" /> Flag for Correction
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
