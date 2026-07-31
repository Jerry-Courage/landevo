import React from "react";
import AdminLayout from "@/components/admin-layout";
import { Link } from "wouter";
import {
  Users, Building2, ArrowRightLeft, Landmark,
  CheckCircle2, Clock, ShieldCheck, ArrowUpRight, ChevronRight,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useGetAdminDashboard, useListTransactions } from "@workspace/api-client-react";

function fmtAmt(n: number) {
  if (n >= 1_000_000_000) return `₦ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

function txDisplayStatus(status: string) {
  switch (status) {
    case "completed":              return "Verification Complete";
    case "cancelled":              return "Cancelled";
    case "verification_complete":  return "Pending Release";
    default:                       return "In Escrow";
  }
}

function statBg(color: string) {
  if (color.includes("indigo"))  return "bg-indigo-500/10 border-indigo-500/20";
  if (color.includes("emerald")) return "bg-emerald-500/10 border-emerald-500/20";
  if (color.includes("sky"))     return "bg-sky-500/10 border-sky-500/20";
  return "bg-violet-500/10 border-violet-500/20";
}

export default function AdminDashboard() {
  const { data: dashboard } = useGetAdminDashboard();
  const { data: txList = [] } = useListTransactions();

  const totalUsers         = (dashboard as any)?.totalUsers         ?? 0;
  const totalAgents        = (dashboard as any)?.totalAgents        ?? 0;
  const totalBuyers        = (dashboard as any)?.totalBuyers        ?? 0;
  const totalListings      = (dashboard as any)?.totalListings      ?? 0;
  const activeListings     = (dashboard as any)?.activeListings     ?? 0;
  const totalTransactions  = (dashboard as any)?.totalTransactions  ?? 0;
  const completedTxns      = (dashboard as any)?.completedTransactions ?? 0;
  const pendingVerifs      = (dashboard as any)?.pendingVerifications  ?? 0;
  const totalEscrowValue   = (dashboard as any)?.totalEscrowValue   ?? 0;
  const volumeData         = (dashboard as any)?.volumeData         ?? [];

  const statCols = [
    { label: "ESCROW VOLUME",        value: totalEscrowValue > 0 ? fmtAmt(totalEscrowValue) : "₦ —", sub: "Platform-wide",                     color: "text-indigo-400",  icon: Landmark },
    { label: "ACTIVE TRANSACTIONS",  value: String(totalTransactions - completedTxns), sub: `${completedTxns} completed`, color: "text-emerald-400", icon: ArrowRightLeft },
    { label: "TOTAL USERS",          value: String(totalUsers), sub: `${totalAgents} agents · ${totalBuyers} buyers`, color: "text-sky-400",    icon: Users },
    { label: "TOTAL LISTINGS",       value: String(totalListings), sub: `${activeListings} active`,       color: "text-violet-400",  icon: Building2 },
  ];

  const escrowQueue = txList
    .filter((t: any) => !["completed", "cancelled"].includes(t.status))
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>SYSTEM ADMINISTRATION</p>
            <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Full platform visibility — escrow, transactions, users, and compliance in one view.
            </p>
          </div>
          <Link href="/admin/escrow">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
              <Landmark className="w-4 h-4" /> Manage Escrow
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCols.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className={`rounded-xl border p-5 ${statBg(s.color)}`} style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                    <Icon className={`w-4 h-4 ${s.color} opacity-70`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white">Transaction Volume Trend</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Monthly escrow value (₦B) — last 6 months</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">LIVE</span>
            </div>
            <div className="h-[220px]">
              {volumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Volume data will appear as transactions are processed
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gEscrow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
                    <Tooltip contentStyle={{ background: "#1c1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#fff" }} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                    <Area type="monotone" dataKey="escrow" name="Escrow (₦B)" stroke="#6366f1" strokeWidth={2} fill="url(#gEscrow)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-bold text-white">Platform Summary</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { icon: ShieldCheck, color: "bg-emerald-500/15", iconColor: "text-emerald-400", label: "Completed Transactions", value: String(completedTxns) },
                { icon: Clock,       color: "bg-amber-500/15",   iconColor: "text-amber-400",   label: "Pending Verifications",  value: String(pendingVerifs) },
                { icon: Users,       color: "bg-sky-500/15",     iconColor: "text-sky-400",     label: "Total Agents",           value: String(totalAgents) },
                { icon: Building2,   color: "bg-violet-500/15",  iconColor: "text-violet-400",  label: "Active Listings",        value: String(activeListings) },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80">{item.label}</p>
                    </div>
                    <p className={`text-sm font-bold ${item.iconColor}`}>{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-sm font-bold text-white">Active Transactions</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Transactions requiring escrow action</p>
            </div>
            <Link href="/admin/escrow">
              <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          {escrowQueue.length === 0 ? (
            <div className="py-12 flex items-center justify-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              No active transactions
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["TXN ID", "PROPERTY", "BUYER", "AGENT", "VALUE", "STATUS", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {escrowQueue.map((txn: any) => {
                    const displayStatus = txDisplayStatus(txn.status);
                    return (
                      <tr key={txn.id} className="border-b transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">#{txn.id}</td>
                        <td className="px-5 py-3.5"><p className="text-sm font-semibold text-white">{txn.listingTitle}</p></td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.buyerName}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.agentName}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-white">{txn.agreedAmount ? fmtAmt(txn.agreedAmount) : fmtAmt(txn.offerAmount ?? 0)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            displayStatus === "Verification Complete" ? "bg-emerald-500/15 text-emerald-400" :
                            displayStatus === "Pending Release" ? "bg-amber-500/15 text-amber-400" :
                            "bg-indigo-500/15 text-indigo-400"
                          }`}>
                            {displayStatus === "Pending Release" ? <Clock className="w-3 h-3" /> : <Landmark className="w-3 h-3" />}
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href="/admin/escrow">
                            <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                              Review <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
