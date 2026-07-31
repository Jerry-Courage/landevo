import React, { useState, useEffect } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreHorizontal, Mail, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

interface Officer {
  id: string;
  name: string;
  email: string;
  role: string;
  state: string;
  assignments: number;
  reviews: number;
  status: string;
  joined: string;
  initials: string;
  color: string;
}

export default function CommissionOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  useEffect(() => {
    fetch("/api/commission/officers")
      .then(r => r.ok ? r.json() : [])
      .then(setOfficers)
      .catch(() => setOfficers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = officers.filter((o) =>
    !search ||
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.role.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">PERSONNEL MANAGEMENT</p>
            <h1 className="text-2xl font-bold tracking-tight">Commission Officers</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage officer accounts, review assignments, and provision new commission staff.</p>
          </div>
          <Button className="font-semibold h-9 bg-emerald-800 hover:bg-emerald-900">
            <Plus className="w-4 h-4 mr-2" /> Provision Officer
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "TOTAL OFFICERS", value: officers.length.toString() },
            { label: "ACTIVE", value: officers.filter(o => o.status === "Active").length.toString() },
            { label: "TOTAL REVIEWS", value: officers.reduce((s, o) => s + o.reviews, 0).toString() },
            { label: "ACTIVE CASES", value: officers.reduce((s, o) => s + o.assignments, 0).toString() },
          ].map((s) => (
            <Card key={s.label} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, role, or email..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex border border-border rounded-lg bg-white overflow-hidden ml-auto">
            <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs font-semibold transition-colors ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Grid</button>
            <button onClick={() => setView("table")} className={`px-3 py-2 text-xs font-semibold transition-colors ${view === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Table</button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center text-sm text-muted-foreground">Loading officers…</div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((officer, i) => (
              <motion.div key={officer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow ${officer.status === "Inactive" ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full ${officer.color} flex items-center justify-center font-bold text-sm text-white flex-shrink-0`}>
                          {officer.initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{officer.name}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {officer.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${officer.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <span className="text-[10px] font-semibold text-muted-foreground">{officer.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{officer.email}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground">REVIEWS</p>
                          <p className="text-sm font-bold">{officer.reviews}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground">ACTIVE</p>
                          <p className="text-sm font-bold">{officer.assignments}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground">SINCE</p>
                          <p className="text-sm font-bold">{officer.joined}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="bg-white/50 border-dashed border-2 border-border shadow-none hover:border-primary/40 hover:bg-white/80 transition-all cursor-pointer">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-muted-foreground">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Add New Officer</p>
                  <p className="text-xs mt-1">Provision a commission staff account</p>
                </div>
              </CardContent>
            </Card>
            {filtered.length === 0 && officers.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <UserPlus className="w-10 h-10 opacity-20" />
                <p className="text-sm font-medium">No commission officers yet — provision accounts from the admin panel</p>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">OFFICER</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">EMAIL</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-center">REVIEWS</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-center">ACTIVE</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((officer) => (
                    <TableRow key={officer.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${officer.color} flex items-center justify-center font-bold text-xs text-white flex-shrink-0`}>{officer.initials}</div>
                          <div>
                            <p className="font-semibold text-sm">{officer.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{officer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{officer.email}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{officer.reviews}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{officer.assignments}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${officer.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                          <span className="text-xs font-medium">{officer.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </CommissionLayout>
  );
}
