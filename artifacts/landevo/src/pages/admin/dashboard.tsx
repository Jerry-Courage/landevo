import React from "react";
import AdminLayout from "@/components/admin-layout";
import { Link } from "wouter";
import {
  Users, Building2, ArrowRightLeft, Landmark,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ShieldCheck, Activity, ArrowUpRight, ChevronRight,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const volumeData = [
  { m: "Jan", escrow: 1.2, transactions: 18 },
  { m: "Feb", escrow: 1.8, transactions: 24 },
  { m: "Mar", escrow: 2.4, transactions: 31 },
  { m: "Apr", escrow: 3.1, transactions: 38 },
  { m: "May", escrow: 4.2, transactions: 45 },
  { m: "Jun", escrow: 5.6, transactions: 52 },
  { m: "Jul", escrow: 6.8, transactions: 61 },
  { m: "Aug", escrow: 8.4, transactions: 70 },
];

const recentActivity = [
  { action: "Escrow released", target: "TXN-8821 — Lekki Phase 1 plot", value: "₦ 48M", time: "3 min ago", type: "release" },
  { action: "New agent registered", target: "Emeka Obi — Lagos State", value: "", time: "11 min ago", type: "user" },
  { action: "Escrow held", target: "TXN-9104 — Ikoyi Commercial Complex", value: "₦ 320M", time: "34 min ago", type: "hold" },
  { action: "Commission verified listing", target: "LND-7734 — Prime Industrial Zone", value: "", time: "1 hr ago", type: "verify" },
  { action: "Escrow dispute flagged", target: "TXN-7720 — Maitama Gardens", value: "₦ 22M", time: "2 hrs ago", type: "flag" },
  { action: "Buyer offer accepted", target: "TXN-8990 — Abuja FCT Residential", value: "₦ 15M", time: "3 hrs ago", type: "user" },
];

const escrowQueue = [
  { id: "TXN-9201", property: "Sunset Heights Estate, Ikoyi", buyer: "Aisha Bello", agent: "Jonas Eze", value: "₦ 48M", status: "Pending Release", days: 2 },
  { id: "TXN-9104", property: "Maitama Commercial Complex", buyer: "Emeka Obi", agent: "Amaka Obi", value: "₦ 320M", status: "Verification Complete", days: 0 },
  { id: "TXN-8990", property: "Abuja FCT Residential Plot", buyer: "Ngozi Eze", agent: "Alex Sterling", value: "₦ 15M", status: "In Escrow", days: 5 },
  { id: "TXN-7720", property: "Maitama Gardens Phase II", buyer: "Tunde Adeyemi", agent: "Kemi Afolabi", value: "₦ 22M", status: "Disputed", days: 12 },
];

const STAT_COLS: { label: string; value: string; sub: string; color: string; icon: React.ElementType }[] = [
  { label: "ESCROW VOLUME", value: "₦ 8.4B", sub: "+12.3% this month", color: "text-indigo-400", icon: Landmark },
  { label: "ACTIVE TRANSACTIONS", value: "247", sub: "38 pending release", color: "text-emerald-400", icon: ArrowRightLeft },
  { label: "TOTAL USERS", value: "14,284", sub: "2,841 agents · 11,443 buyers", color: "text-sky-400", icon: Users },
  { label: "VERIFIED LISTINGS", value: "1,902", sub: "97.4% approval rate", color: "text-violet-400", icon: Building2 },
];

function statBg(color: string) {
  if (color.includes("indigo")) return "bg-indigo-500/10 border-indigo-500/20";
  if (color.includes("emerald")) return "bg-emerald-500/10 border-emerald-500/20";
  if (color.includes("sky")) return "bg-sky-500/10 border-sky-500/20";
  return "bg-violet-500/10 border-violet-500/20";
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_COLS.map((s, i) => {
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

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white">Escrow Volume & Transactions</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Platform-wide cumulative trend (Jan – Aug)</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">LIVE</span>
            </div>
            <div className="h-[220px]">
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
                  <Tooltip
                    contentStyle={{ background: "#1c1f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#fff" }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Area type="monotone" dataKey="escrow" name="Escrow (₦B)" stroke="#6366f1" strokeWidth={2} fill="url(#gEscrow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-bold text-white">Live Activity</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {recentActivity.map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === "release" ? "bg-emerald-500/15" :
                    item.type === "hold" ? "bg-indigo-500/15" :
                    item.type === "flag" ? "bg-red-500/15" :
                    item.type === "verify" ? "bg-sky-500/15" : "bg-white/8"
                  }`}>
                    {item.type === "release" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                     item.type === "hold" ? <Landmark className="w-3.5 h-3.5 text-indigo-400" /> :
                     item.type === "flag" ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> :
                     item.type === "verify" ? <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> :
                     <Users className="w-3.5 h-3.5 text-white/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 leading-snug">{item.action}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.target}</p>
                    {item.value && <p className="text-[11px] font-bold text-indigo-400 mt-0.5">{item.value}</p>}
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Escrow Queue */}
        <div className="rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-sm font-bold text-white">Escrow Queue</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Transactions requiring escrow action</p>
            </div>
            <Link href="/admin/escrow">
              <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["TXN ID", "PROPERTY", "BUYER", "AGENT", "VALUE", "STATUS", "ACTION"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escrowQueue.map((txn) => (
                  <tr key={txn.id} className="border-b transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">{txn.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-white">{txn.property}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.buyer}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.agent}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">{txn.value}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        txn.status === "Verification Complete" ? "bg-emerald-500/15 text-emerald-400" :
                        txn.status === "Pending Release" ? "bg-amber-500/15 text-amber-400" :
                        txn.status === "Disputed" ? "bg-red-500/15 text-red-400" :
                        "bg-indigo-500/15 text-indigo-400"
                      }`}>
                        {txn.status === "Verification Complete" ? <CheckCircle2 className="w-3 h-3" /> :
                         txn.status === "Pending Release" ? <Clock className="w-3 h-3" /> :
                         txn.status === "Disputed" ? <AlertTriangle className="w-3 h-3" /> :
                         <Landmark className="w-3 h-3" />}
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {txn.status === "Verification Complete" && (
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                          Release
                        </button>
                      )}
                      {txn.status === "Disputed" && (
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors border border-red-500/20">
                          Resolve
                        </button>
                      )}
                      {(txn.status === "In Escrow" || txn.status === "Pending Release") && (
                        <Link href="/admin/escrow">
                          <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            Review <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
