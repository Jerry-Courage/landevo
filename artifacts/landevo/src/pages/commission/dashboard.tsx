import React from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Building2, Clock, CheckCircle2, XCircle, ArrowUpRight, Users, FileText, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useGetCommissionDashboard } from "@workspace/api-client-react";

const chartData = [
  { month: "May", approved: 21, rejected: 4 },
  { month: "Jun", approved: 28, rejected: 6 },
  { month: "Jul", approved: 34, rejected: 5 },
  { month: "Aug", approved: 38, rejected: 8 },
  { month: "Sep", approved: 42, rejected: 7 },
  { month: "Oct", approved: 31, rejected: 9 },
];

function statusBadge(status: string) {
  switch (status) {
    case "pending":    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-[10px]">Pending</Badge>;
    case "in_review":  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-[10px]">In Review</Badge>;
    case "approved":   return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px]">Approved</Badge>;
    case "rejected":   return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-[10px]">Rejected</Badge>;
    default:           return <Badge className="bg-gray-100 text-gray-700 text-[10px]">{status}</Badge>;
  }
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function CommissionDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = useGetCommissionDashboard();

  const pendingCount    = dashboard?.pendingVerifications    ?? 0;
  const inReviewCount   = dashboard?.inReviewVerifications   ?? 0;
  const approvedMonth   = dashboard?.approvedThisMonth       ?? 0;
  const rejectedMonth   = dashboard?.rejectedThisMonth       ?? 0;
  const recentVerifs    = dashboard?.recentVerifications     ?? [];

  const pendingList  = recentVerifs.filter(v => v.status === "pending"   || v.status === "in_review");
  const totalPending = pendingCount + inReviewCount;

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">LAND COMMISSION PORTAL</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Commission Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome, {user?.name?.split(" ")[0] ?? "Officer"}. {totalPending} verification{totalPending !== 1 ? "s" : ""} require{totalPending === 1 ? "s" : ""} your attention.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/commission/verifications">
              <Button className="font-semibold h-9 bg-emerald-800 hover:bg-emerald-900">
                Review Verifications
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "PENDING",       value: pendingCount,  icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50   border-amber-200" },
            { label: "IN REVIEW",     value: inReviewCount, icon: FileText,     color: "text-blue-600",    bg: "bg-blue-50    border-blue-200" },
            { label: "APPROVED THIS MONTH", value: approvedMonth, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "REJECTED THIS MONTH", value: rejectedMonth, icon: XCircle,      color: "text-red-600",    bg: "bg-red-50     border-red-200" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`bg-white shadow-sm border ${s.bg}`}>
                  <CardContent className="p-5 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{s.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                    <Icon className={`w-5 h-5 ${s.color} opacity-60 mt-1`} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Chart + Pending list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Monthly Review Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="approved" name="Approved" fill="#059669" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="rejected"  name="Rejected"  fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/commission/verifications">
                <Button variant="outline" className="w-full justify-between font-semibold">
                  Review Queue <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{totalPending}</span>
                </Button>
              </Link>
              <Link href="/commission/audit">
                <Button variant="outline" className="w-full justify-start font-semibold text-muted-foreground">
                  Activity Log
                </Button>
              </Link>
              <Link href="/commission/officers">
                <Button variant="outline" className="w-full justify-start font-semibold text-muted-foreground">
                  Manage Officers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending verifications table */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Pending Verification Queue</CardTitle>
            <Link href="/commission/verifications" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingList.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 opacity-20" />
                <p className="text-sm font-medium">All clear — no pending verifications</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground pl-5">LISTING</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">AGENT</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">SUBMITTED</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground">STATUS</TableHead>
                    <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground text-right pr-5">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingList.slice(0, 6).map((v) => (
                    <TableRow key={v.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-5 font-semibold text-sm">{v.listingTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.agentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmt(v.submittedAt)}</TableCell>
                      <TableCell>{statusBadge(v.status)}</TableCell>
                      <TableCell className="text-right pr-5">
                        <Link href="/commission/verifications">
                          <Button size="sm" className="h-7 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800">
                            Review
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </CommissionLayout>
  );
}
