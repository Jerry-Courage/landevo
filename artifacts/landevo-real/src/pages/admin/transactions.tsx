import React, { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { ArrowRightLeft, Search, CheckCircle2, Clock, AlertTriangle, Landmark, XCircle } from "lucide-react";

type TxnStatus = "All" | "Completed" | "In Progress" | "Disputed" | "Cancelled";

const transactions = [
  { id: "TXN-9201", property: "Sunset Heights Estate, Ikoyi", buyer: "Aisha Bello", agent: "Jonas Eze", value: 48000000, escrow: "Pending Release", status: "In Progress", date: "Oct 18, 2023", commission: "Cleared" },
  { id: "TXN-9104", property: "Maitama Commercial Complex", buyer: "Emeka Obi", agent: "Amaka Obi", value: 320000000, escrow: "Pending Release", status: "In Progress", date: "Oct 17, 2023", commission: "Cleared" },
  { id: "TXN-8990", property: "Abuja FCT Residential Plot", buyer: "Ngozi Eze", agent: "Alex Sterling", value: 15000000, escrow: "In Escrow", status: "In Progress", date: "Oct 15, 2023", commission: "Pending" },
  { id: "TXN-8821", property: "Lekki Phase 1 Corner Plot", buyer: "Samuel Akin", agent: "Kemi Afolabi", value: 25000000, escrow: "Released", status: "Completed", date: "Oct 10, 2023", commission: "Cleared" },
  { id: "TXN-8654", property: "Emerald Valley Phase II", buyer: "Bola Adeyemi", agent: "Musa Ibrahim", value: 18500000, escrow: "Released", status: "Completed", date: "Oct 5, 2023", commission: "Cleared" },
  { id: "TXN-7720", property: "Maitama Gardens Phase II", buyer: "Tunde Adeyemi", agent: "Kemi Afolabi", value: 22000000, escrow: "Disputed", status: "Disputed", date: "Sep 28, 2023", commission: "On Hold" },
  { id: "TXN-7615", property: "Hilltop Acreage, Abeokuta", buyer: "Chioma Obi", agent: "Adaeze Nwosu", value: 9800000, escrow: "Refunded", status: "Cancelled", date: "Sep 20, 2023", commission: "N/A" },
  { id: "TXN-7502", property: "Prime Waterfront Plot, VI", buyer: "Felix Mensah", agent: "Ngozi Adeyemi", value: 245000000, escrow: "Released", status: "Completed", date: "Sep 15, 2023", commission: "Cleared" },
];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `₦ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

const statusStyle: Record<string, string> = {
  "Completed": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Progress": "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Disputed": "bg-red-500/15 text-red-400 border-red-500/20",
  "Cancelled": "bg-slate-500/15 text-slate-400 border-slate-500/20",
};
const statusIcon: Record<string, React.ElementType> = {
  "Completed": CheckCircle2, "In Progress": Clock, "Disputed": AlertTriangle, "Cancelled": XCircle,
};

const tabs: TxnStatus[] = ["All", "In Progress", "Completed", "Disputed", "Cancelled"];

export default function AdminTransactions() {
  const [tab, setTab] = useState<TxnStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    const matchTab = tab === "All" || t.status === tab;
    const matchSearch = !search || t.property.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) || t.buyer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalVolume = transactions.reduce((s, t) => s + t.value, 0);
  const completedVolume = transactions.filter(t => t.status === "Completed").reduce((s, t) => s + t.value, 0);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>TRANSACTION REGISTRY</p>
          <h1 className="text-2xl font-bold text-white">All Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Complete record of every property transaction across the platform.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "TOTAL VOLUME", value: fmt(totalVolume), color: "text-white" },
            { label: "COMPLETED", value: fmt(completedVolume), color: "text-emerald-400" },
            { label: "IN PROGRESS", value: transactions.filter(t => t.status === "In Progress").length.toString(), color: "text-indigo-400" },
            { label: "DISPUTED", value: transactions.filter(t => t.status === "Disputed").length.toString(), color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              placeholder="Search TXN ID, property, or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg text-sm w-72 outline-none focus:ring-1 focus:ring-indigo-500/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-3 py-2 text-xs font-semibold transition-colors"
                style={{ background: tab === t ? "rgba(99,102,241,0.2)" : "transparent", color: tab === t ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                {["TXN ID", "PROPERTY", "BUYER", "AGENT", "VALUE", "ESCROW", "COMMISSION", "DATE", "STATUS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => {
                const StatusIcon = statusIcon[txn.status];
                return (
                  <tr key={txn.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">{txn.id}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-white max-w-[180px]">
                      <span className="truncate block">{txn.property}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.buyer}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.agent}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">{fmt(txn.value)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        <Landmark className={`w-3 h-3 ${txn.escrow === "Released" ? "text-emerald-400" : txn.escrow === "Disputed" ? "text-red-400" : "text-indigo-400"}`} />
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{txn.escrow}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${txn.commission === "Cleared" ? "text-emerald-400" : txn.commission === "On Hold" ? "text-red-400" : txn.commission === "N/A" ? "text-white/25" : "text-amber-400"}`}>
                        {txn.commission}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{txn.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle[txn.status]}`}>
                        <StatusIcon className="w-3 h-3" />{txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
