import React, { useState } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2, Search, Download, CheckCircle2, XCircle,
  Clock, Eye, AlertTriangle, MapPin, Ruler, FileText
} from "lucide-react";
import { motion } from "framer-motion";

type AuditStatus = "All" | "Awaiting Audit" | "Under Review" | "Approved" | "Correction Required";

const listings = [
  {
    id: "LND-9108", name: "Oakwood Residential Estate", location: "Epe, Lagos State", agent: "Alex Sterling",
    agentId: "AGT-1120", type: "Residential", size: "900 sqm", value: 15000000,
    submitted: "Oct 22, 2023", status: "Awaiting Audit", docs: 4,
    notes: "Certificate of Occupancy attached. Survey plan pending official stamp.",
  },
  {
    id: "LND-5591", name: "Maitama Commercial Complex", location: "Maitama, Abuja FCT", agent: "Amaka Obi",
    agentId: "AGT-1112", type: "Commercial", size: "3,200 sqm", value: 320000000,
    submitted: "Oct 21, 2023", status: "Awaiting Audit", docs: 6,
    notes: "High-value asset. Priority audit requested.",
  },
  {
    id: "LND-9812", name: "Sunset Heights Estate", location: "Ikoyi, Lagos State", agent: "Jonas Eze",
    agentId: "AGT-1115", type: "Residential", size: "1,200 sqm", value: 48000000,
    submitted: "Oct 20, 2023", status: "Under Review", docs: 5,
    notes: "Title verification in progress with Lagos State Land Registry.",
  },
  {
    id: "LND-8821", name: "Emerald Valley Phase II", location: "Lekki, Lagos State", agent: "Kemi Afolabi",
    agentId: "AGT-1139", type: "Residential", size: "600 sqm", value: 25000000,
    submitted: "Oct 18, 2023", status: "Under Review", docs: 3,
    notes: "Phase I already approved. Phase II shares survey plan.",
  },
  {
    id: "LND-8422", name: "Riverside Garden Plots", location: "Ikorodu, Lagos State", agent: "Tunde Bakare",
    agentId: "AGT-1138", type: "Residential", size: "450 sqm", value: 8500000,
    submitted: "Oct 15, 2023", status: "Correction Required", docs: 2,
    notes: "Survey plan dimensions don't match site measurement report. Agent must resubmit corrected plan.",
  },
  {
    id: "LND-7734", name: "Prime Industrial Zone", location: "Agbara, Ogun State", agent: "Musa Ibrahim",
    agentId: "AGT-1130", type: "Industrial", size: "5,000 sqm", value: 120000000,
    submitted: "Oct 12, 2023", status: "Approved", docs: 7,
    notes: "All documents verified. Environmental impact assessment cleared.",
  },
  {
    id: "LND-4411", name: "Prime Waterfront Commercial Plot", location: "Victoria Island, Lagos", agent: "Ngozi Adeyemi",
    agentId: "AGT-1143", type: "Commercial", size: "2,400 sqm", value: 245000000,
    submitted: "Oct 10, 2023", status: "Approved", docs: 8,
    notes: "Approved by Senior Officer Bola Tinubu. VGIS coordinates confirmed.",
  },
  {
    id: "LND-3392", name: "Hilltop Agricultural Acreage", location: "Abeokuta, Ogun State", agent: "Adaeze Nwosu",
    agentId: "AGT-1135", type: "Agricultural", size: "10,000 sqm", value: 35000000,
    submitted: "Oct 8, 2023", status: "Correction Required", docs: 3,
    notes: "Partial C of O submitted. Full document required for agricultural zoning.",
  },
];

const statusConfig: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  "Awaiting Audit": { bg: "bg-amber-100 text-amber-800", label: "AWAITING", icon: Clock },
  "Under Review": { bg: "bg-blue-100 text-blue-800", label: "REVIEWING", icon: Eye },
  "Approved": { bg: "bg-emerald-100 text-emerald-800", label: "APPROVED", icon: CheckCircle2 },
  "Correction Required": { bg: "bg-red-100 text-red-800", label: "CORRECTION", icon: AlertTriangle },
};

const tabs: AuditStatus[] = ["All", "Awaiting Audit", "Under Review", "Approved", "Correction Required"];
type FilterStatus = Exclude<AuditStatus, "All">;

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

export default function CommissionListings() {
  const [activeTab, setActiveTab] = useState<AuditStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

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
            <p className="text-muted-foreground mt-1 text-sm">Verify property documents and approve listings for publication on the platform.</p>
          </div>
          <Button variant="outline" className="bg-white font-semibold h-9">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {(tabs.slice(1) as FilterStatus[]).map((s) => {
            const count = listings.filter((l) => l.status === s).length;
            const colors: Record<FilterStatus, string> = {
              "Awaiting Audit": "border-l-amber-400",
              "Under Review": "border-l-blue-400",
              "Approved": "border-l-emerald-500",
              "Correction Required": "border-l-red-400",
            };
            const color = colors[s] ?? "";
            return (
              <Card key={s} className={`bg-white shadow-sm border-l-4 ${color} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setActiveTab(s)}>
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
                      const cfg = statusConfig[listing.status];
                      const Icon = cfg.icon;
                      const isSelected = selected === listing.id;
                      return (
                        <TableRow key={listing.id} className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/40" : "hover:bg-muted/20"}`}
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
                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-amber-600 border-amber-200 hover:bg-amber-50">Flag</Button>
                                <Button size="sm" className="h-7 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800">Approve</Button>
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
                {filtered.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <Building2 className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">No listings match this filter</p>
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
                    {[
                      ["Location", selectedListing.location],
                      ["Type", selectedListing.type],
                      ["Size", selectedListing.size],
                      ["Value", formatCurrency(selectedListing.value)],
                      ["Agent", `${selectedListing.agent} (${selectedListing.agentId})`],
                      ["Submitted", selectedListing.submitted],
                      ["Documents", `${selectedListing.docs} files`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                        <span className="text-xs text-right font-medium max-w-[160px]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">OFFICER NOTES</p>
                    <p className="text-xs text-foreground leading-relaxed bg-muted/30 rounded-md p-3">{selectedListing.notes}</p>
                  </div>
                  {(selectedListing.status === "Awaiting Audit" || selectedListing.status === "Under Review") && (
                    <div className="border-t pt-3 space-y-2">
                      <Button className="w-full h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Publish
                      </Button>
                      <Button variant="outline" className="w-full h-9 font-semibold text-sm text-amber-600 border-amber-200 hover:bg-amber-50">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Flag for Correction
                      </Button>
                      <Button variant="ghost" className="w-full h-9 text-xs font-semibold text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5 mr-2" /> Reject Listing
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
