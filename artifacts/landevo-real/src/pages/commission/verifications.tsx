import React, { useState } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldCheck, ShieldX, Clock, Search, Download, CheckCircle2,
  XCircle, Eye, FileText, AlertCircle, ChevronRight, User
} from "lucide-react";
import { motion } from "framer-motion";

type VerifStatus = "All" | "Pending Review" | "Under Review" | "Approved" | "Rejected";

const agents = [
  { id: "AGT-1142", name: "Emeka Obi", email: "emeka.obi@email.com", state: "Lagos State", submitted: "Oct 22, 2023", docs: 3, status: "Pending Review", license: "Lagos State Practice License", priority: true },
  { id: "AGT-1143", name: "Ngozi Adeyemi", email: "ngozi.a@email.com", state: "Lagos State", submitted: "Oct 22, 2023", docs: 2, status: "Pending Review", license: "NIESV Certificate", priority: false },
  { id: "AGT-1139", name: "Kemi Afolabi", email: "kemi.af@realty.ng", state: "Ogun State", submitted: "Oct 20, 2023", docs: 4, status: "Under Review", license: "Federal Surveyor License", priority: false },
  { id: "AGT-1138", name: "Tunde Bakare", email: "tunde.b@prop.ng", state: "Abuja FCT", submitted: "Oct 19, 2023", docs: 3, status: "Under Review", license: "Abuja FCT Agent Permit", priority: false },
  { id: "AGT-1135", name: "Adaeze Nwosu", email: "adaeze.n@realty.com", state: "Rivers State", submitted: "Oct 17, 2023", docs: 5, status: "Pending Review", license: "Rivers State Registry", priority: true },
  { id: "AGT-1130", name: "Musa Ibrahim", email: "musa.i@land.ng", state: "Kano State", submitted: "Oct 15, 2023", docs: 3, status: "Pending Review", license: "Kano Land Bureau Cert", priority: false },
  { id: "AGT-1120", name: "Alex Sterling", email: "alex.s@sterling.ng", state: "Lagos State", submitted: "Oct 10, 2023", docs: 5, status: "Approved", license: "Lagos State Practice License", priority: false },
  { id: "AGT-1115", name: "Jonas Eze", email: "jonas.e@ez.ng", state: "Lagos State", submitted: "Oct 8, 2023", docs: 3, status: "Rejected", license: "NIESV Certificate", priority: false },
  { id: "AGT-1112", name: "Fatima Bello", email: "fatima.b@homes.ng", state: "Abuja FCT", submitted: "Oct 6, 2023", docs: 4, status: "Approved", license: "Abuja FCT Agent Permit", priority: false },
  { id: "AGT-1108", name: "Chidi Nkem", email: "chidi.n@prop.ng", state: "Anambra State", submitted: "Oct 3, 2023", docs: 2, status: "Rejected", license: "Anambra State Cert", priority: false },
];

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "Pending Review": { bg: "bg-amber-100 text-amber-800", text: "PENDING", icon: Clock },
  "Under Review": { bg: "bg-blue-100 text-blue-800", text: "UNDER REVIEW", icon: Eye },
  "Approved": { bg: "bg-emerald-100 text-emerald-800", text: "APPROVED", icon: CheckCircle2 },
  "Rejected": { bg: "bg-red-100 text-red-800", text: "REJECTED", icon: XCircle },
};

const tabs: VerifStatus[] = ["All", "Pending Review", "Under Review", "Approved", "Rejected"];

export default function CommissionVerifications() {
  const [activeTab, setActiveTab] = useState<VerifStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = agents.filter((a) => {
    const matchesTab = activeTab === "All" || a.status === activeTab;
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) || a.state.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedAgent = agents.find((a) => a.id === selected);

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">AGENT CREDENTIALING</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agent Verifications</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review and approve agent credential submissions before they can list on the platform.</p>
          </div>
          <Button variant="outline" className="bg-white font-semibold h-9">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Pending Review", count: agents.filter(a => a.status === "Pending Review").length, color: "border-l-amber-400" },
            { label: "Under Review", count: agents.filter(a => a.status === "Under Review").length, color: "border-l-blue-400" },
            { label: "Approved", count: agents.filter(a => a.status === "Approved").length, color: "border-l-emerald-500" },
            { label: "Rejected", count: agents.filter(a => a.status === "Rejected").length, color: "border-l-red-400" },
          ].map((s) => (
            <Card key={s.label} className={`bg-white shadow-sm border-l-4 ${s.color}`}>
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.label.toUpperCase()}</p>
                <p className="text-2xl font-bold mt-1">{s.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Main table */}
          <div className={`flex flex-col gap-4 ${selectedAgent ? "flex-1" : "w-full"}`}>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, ID, or state..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex border border-border rounded-lg bg-white overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
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
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">AGENT</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATE</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">LICENSE TYPE</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">DOCS</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                      <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((agent) => {
                      const cfg = statusConfig[agent.status];
                      const Icon = cfg.icon;
                      const isSelected = selected === agent.id;
                      return (
                        <TableRow
                          key={agent.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/40" : "hover:bg-muted/20"}`}
                          onClick={() => setSelected(isSelected ? null : agent.id)}
                        >
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{agent.name}</span>
                                  {agent.priority && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">PRIORITY</span>}
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono">{agent.id}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{agent.state}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{agent.license}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{agent.submitted}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-semibold">{agent.docs}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            {(agent.status === "Pending Review" || agent.status === "Under Review") && (
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50">
                                  Reject
                                </Button>
                                <Button size="sm" className="h-7 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800">
                                  Approve
                                </Button>
                              </div>
                            )}
                            {agent.status === "Approved" && (
                              <span className="text-xs text-emerald-700 font-semibold">✓ Cleared</span>
                            )}
                            {agent.status === "Rejected" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" onClick={(e) => { e.stopPropagation(); }}>
                                Reopen
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <ShieldCheck className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">No agents match this filter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail panel */}
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 flex-shrink-0"
            >
              <Card className="bg-white shadow-sm sticky top-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedAgent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedAgent.id}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3 text-sm">
                    {[
                      ["Email", selectedAgent.email],
                      ["State", selectedAgent.state],
                      ["License Type", selectedAgent.license],
                      ["Submitted", selectedAgent.submitted],
                      ["Documents", `${selectedAgent.docs} files`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground text-xs font-semibold">{label}</span>
                        <span className="text-xs text-right font-medium max-w-[160px]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">SUBMITTED DOCUMENTS</p>
                    {["Estate_Agent_License_2024.pdf", "National_ID_Front.jpg", selectedAgent.docs >= 3 ? "National_ID_Back.jpg" : null, selectedAgent.docs >= 4 ? "Tax_Clearance_2023.pdf" : null, selectedAgent.docs >= 5 ? "Professional_Reference.pdf" : null].filter(Boolean).map((doc) => (
                      <div key={doc as string} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] font-medium truncate max-w-[140px]">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {(selectedAgent.status === "Pending Review" || selectedAgent.status === "Under Review") && (
                    <div className="border-t pt-3 space-y-2">
                      <Button className="w-full h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-sm">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Approve Agent
                      </Button>
                      <Button variant="outline" className="w-full h-9 font-semibold text-sm text-red-600 border-red-200 hover:bg-red-50">
                        <ShieldX className="w-4 h-4 mr-2" /> Reject & Notify
                      </Button>
                      <Button variant="ghost" className="w-full h-9 font-semibold text-xs text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 mr-2" /> Request Resubmission
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
