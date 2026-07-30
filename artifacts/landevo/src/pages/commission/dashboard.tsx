import React from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Building2, Clock, CheckCircle2, XCircle, ArrowUpRight, Users, FileText, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const chartData = [
  { month: "May", approved: 21, rejected: 4 },
  { month: "Jun", approved: 28, rejected: 6 },
  { month: "Jul", approved: 34, rejected: 5 },
  { month: "Aug", approved: 38, rejected: 8 },
  { month: "Sep", approved: 42, rejected: 7 },
  { month: "Oct", approved: 31, rejected: 9 },
];

const pendingVerifications = [
  { id: "AGT-1142", name: "Emeka Obi", state: "Lagos State", submitted: "Oct 22, 2023", docs: 3 },
  { id: "AGT-1143", name: "Ngozi Adeyemi", state: "Lagos State", submitted: "Oct 22, 2023", docs: 2 },
  { id: "AGT-1139", name: "Kemi Afolabi", state: "Ogun State", submitted: "Oct 20, 2023", docs: 4 },
  { id: "AGT-1138", name: "Tunde Bakare", state: "Abuja FCT", submitted: "Oct 19, 2023", docs: 3 },
];

const pendingListings = [
  { id: "LND-9108", name: "Oakwood Residential, Epe", agent: "Alex Sterling", value: "₦ 15M", submitted: "Oct 22" },
  { id: "LND-5591", name: "Maitama Commercial Complex", agent: "Amaka Obi", value: "₦ 320M", submitted: "Oct 21" },
  { id: "LND-9812", name: "Sunset Heights Estate, Ikoyi", agent: "Jonas Eze", value: "₦ 48M", submitted: "Oct 20" },
];

const recentActivity = [
  { officer: "C. Okoro", action: "Approved agent verification", target: "Alex Sterling (AGT-1120)", time: "10 mins ago", type: "approve" },
  { officer: "F. Hassan", action: "Flagged listing for correction", target: "Riverside Garden Plots (LND-8422)", time: "45 mins ago", type: "flag" },
  { officer: "C. Okoro", action: "Rejected document submission", target: "Jonas Eze (AGT-1115)", time: "2 hrs ago", type: "reject" },
  { officer: "I. Musa", action: "Cleared listing audit", target: "Prime Industrial Zone (LND-7734)", time: "3 hrs ago", type: "approve" },
  { officer: "F. Hassan", action: "Requested resubmission", target: "Tunde Bakare (AGT-1138)", time: "Yesterday", type: "flag" },
];

export default function CommissionDashboard() {
  const { user } = useAuth();

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">LAND COMMISSION PORTAL</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Commission Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome, {user?.name?.split(" ")[0] ?? "Officer"}. {pendingVerifications.length + pendingListings.length} items require your attention today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/commission/verifications">
              <Button variant="outline" className="bg-white font-semibold">Review Queue</Button>
            </Link>
            <Link href="/commission/listings">
              <Button className="font-semibold">Audit Listings</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "PENDING VERIFICATIONS", value: "47", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", delta: "+12 today", up: false },
            { label: "LISTINGS AWAITING AUDIT", value: "23", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", delta: "+5 today", up: false },
            { label: "APPROVED THIS MONTH", value: "128", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", delta: "+8.4%", up: true },
            { label: "ACTIVE OFFICERS", value: "12", icon: Users, color: "text-purple-600", bg: "bg-purple-50", delta: "Across 6 states", up: true },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="hover:shadow-md transition-shadow bg-white">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider leading-tight">{stat.label}</p>
                      <div className={cn("p-1.5 rounded-md", stat.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                    <p className={cn("text-xs font-semibold mt-1", stat.up ? "text-emerald-600" : "text-amber-600")}>{stat.delta}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Verification Outcomes</CardTitle>
              <CardDescription>Monthly approvals vs rejections (May – Oct 2023)</CardDescription>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="approved" name="Approved" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      item.type === "approve" ? "bg-emerald-100" : item.type === "reject" ? "bg-red-100" : "bg-amber-100"
                    )}>
                      {item.type === "approve" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                       item.type === "reject" ? <XCircle className="w-3.5 h-3.5 text-red-500" /> :
                       <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug">{item.action}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.target}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.officer} · {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <Link href="/commission/audit">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold">
                    View Full Log <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Pending Agent Verifications</CardTitle>
              <CardDescription>Agents awaiting credential review — oldest first</CardDescription>
            </div>
            <Link href="/commission/verifications">
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                View All 47 <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">AGENT ID</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">FULL NAME</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATE</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">DOCS</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVerifications.map((agent) => (
                  <TableRow key={agent.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">{agent.id}</TableCell>
                    <TableCell className="font-semibold text-sm">{agent.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{agent.state}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{agent.submitted}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-semibold">{agent.docs} files</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/commission/verifications">
                        <Button size="sm" className="h-7 text-xs font-semibold">Review</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Listings */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Listings Awaiting Audit</CardTitle>
              <CardDescription>Properties submitted by agents for commission clearance</CardDescription>
            </div>
            <Link href="/commission/listings">
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                View All 23 <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">LISTING ID</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">PROPERTY</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">AGENT</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right">VALUE</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingListings.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">{listing.id}</TableCell>
                    <TableCell className="font-semibold text-sm">{listing.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{listing.agent}</TableCell>
                    <TableCell className="text-sm font-semibold text-right">{listing.value}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{listing.submitted}</TableCell>
                    <TableCell className="text-right">
                      <Link href="/commission/listings">
                        <Button size="sm" className="h-7 text-xs font-semibold">Audit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CommissionLayout>
  );
}

// Helper
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
