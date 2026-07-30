import React, { useState } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Plus, MoreHorizontal, ShieldCheck, CheckCircle2, MapPin, Mail, Phone, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const officers = [
  {
    id: "OFF-001", name: "Bola Tinubu", email: "director@landcom.ng", phone: "+234 801 000 0001",
    role: "Director", state: "Federal / All States", assignments: 0, reviews: 0,
    status: "Active", joined: "Jan 2021", initials: "BT", color: "bg-emerald-800",
  },
  {
    id: "OFF-002", name: "Chidi Okoro", email: "c.okoro@landcom.ng", phone: "+234 802 111 0002",
    role: "Senior Officer", state: "Lagos State", assignments: 18, reviews: 142,
    status: "Active", joined: "Mar 2021", initials: "CO", color: "bg-emerald-700",
  },
  {
    id: "OFF-003", name: "Fatima Hassan", email: "f.hassan@landcom.ng", phone: "+234 803 222 0003",
    role: "Review Officer", state: "Ogun State / Lagos State", assignments: 12, reviews: 89,
    status: "Active", joined: "Jun 2021", initials: "FH", color: "bg-teal-700",
  },
  {
    id: "OFF-004", name: "Ibrahim Musa", email: "i.musa@landcom.ng", phone: "+234 804 333 0004",
    role: "Field Officer", state: "Kano State / Abuja FCT", assignments: 9, reviews: 67,
    status: "Active", joined: "Aug 2021", initials: "IM", color: "bg-slate-700",
  },
  {
    id: "OFF-005", name: "Emeka Obi", email: "e.obi@landcom.ng", phone: "+234 805 444 0005",
    role: "Review Officer", state: "Rivers State / Delta State", assignments: 11, reviews: 54,
    status: "Active", joined: "Nov 2021", initials: "EO", color: "bg-emerald-600",
  },
  {
    id: "OFF-006", name: "Ngozi Adeyemi", email: "n.adeyemi@landcom.ng", phone: "+234 806 555 0006",
    role: "Review Officer", state: "Lagos State", assignments: 4, reviews: 8,
    status: "Active", joined: "Oct 2023", initials: "NA", color: "bg-teal-600",
  },
  {
    id: "OFF-007", name: "Kunle Adebayo", email: "k.adebayo@landcom.ng", phone: "+234 807 666 0007",
    role: "Field Officer", state: "Oyo State / Osun State", assignments: 7, reviews: 33,
    status: "Inactive", joined: "Jan 2022", initials: "KA", color: "bg-slate-500",
  },
];

const roleColors: Record<string, string> = {
  "Director": "bg-purple-100 text-purple-800",
  "Senior Officer": "bg-emerald-100 text-emerald-800",
  "Review Officer": "bg-blue-100 text-blue-800",
  "Field Officer": "bg-amber-100 text-amber-700",
};

export default function CommissionOfficers() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = officers.filter((o) =>
    !search ||
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.role.toLowerCase().includes(search.toLowerCase()) ||
    o.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "TOTAL OFFICERS", value: officers.length.toString() },
            { label: "ACTIVE", value: officers.filter(o => o.status === "Active").length.toString() },
            { label: "TOTAL REVIEWS", value: officers.reduce((s, o) => s + o.reviews, 0).toString() },
            { label: "STATES COVERED", value: "16" },
          ].map((s) => (
            <Card key={s.label} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, role, or state..." className="pl-9 h-9 bg-white text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex border border-border rounded-lg bg-white overflow-hidden ml-auto">
            <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs font-semibold transition-colors ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Grid</button>
            <button onClick={() => setView("table")} className={`px-3 py-2 text-xs font-semibold transition-colors ${view === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>Table</button>
          </div>
        </div>

        {view === "grid" ? (
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[officer.role] ?? "bg-gray-100 text-gray-700"}`}>
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
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{officer.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{officer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{officer.phone}</span>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {/* Add officer card */}
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
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">OFFICER</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">ROLE</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">JURISDICTION</TableHead>
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
                      <TableCell>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[officer.role] ?? "bg-gray-100 text-gray-700"}`}>{officer.role.toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{officer.state}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{officer.reviews}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{officer.assignments}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${officer.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                          <span className="text-xs font-medium">{officer.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          {officer.status === "Active" ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50">Deactivate</Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50">Reactivate</Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                        </div>
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
