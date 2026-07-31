import React, { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { ArrowRightLeft, Search, CheckCircle2, Clock, AlertTriangle, Landmark, XCircle } from "lucide-react";
import { useListTransactions } from "@workspace/api-client-react";

type TxnStatus = "All" | "Completed" | "In Progress" | "Cancelled";

function fmtAmt(n: number) {
  if (n >= 1_000_000_000) return `₦ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function toDisplayStatus(s: string): TxnStatus {
  if (s === "completed")  return "Completed";
  if (s === "cancelled")  return "Cancelled";
  return "In Progress";
}

function toEscrowLabel(s: string) {
  switch (s) {
    case "completed":             return "Released";
    case "cancelled":             return "Refunded";
    case "verification_complete": return "Pending Release";
    case "escrow_opened":
    case "funds_deposited":       return "In Escrow";
    default:                      return "In Escrow";
  }
}

const statusStyle: Record<TxnStatus, string> = {
  All:           "",
  Completed:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Progress": "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Cancelled:   "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

const statusIcon: Record<TxnStatus, React.ElementType> = {
  All:           Landmark,
  Completed:     CheckCircle2,
  "In Progress": Clock,
  Cancelled:     XCircle,
};

const tabs: TxnStatus[] = ["All", "In Progress", "Completed", "Cancelled"];

export default function AdminTransactions() {
  const [tab, setTab] = useState<TxnStatus>("All");
  const [search, setSearch] = useState("");

  const { data: rawTxns = [] } = useListTransactions();

  const transactions = rawTxns.map((t) => ({
    id:         t.id,
    property:   t.listingTitle,
    buyer:      t.buyerName,
    agent:      t.agentName,
    value:      t.agreedAmount ?? t.offerAmount ?? 0,
    escrow:     toEscrowLabel(t.status),
    status:     toDisplayStatus(t.status),
    date:       fmtDate(t.createdAt),
    rawStatus:  t.status,
  }));

  const filtered = transactions.filter((t) => {
    const matchTab = tab === "All" || t.status === tab;
    const matchSearch = !search ||
      t.property.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search) ||
      t.buyer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalVolume    = transactions.reduce((s, t) => s + t.value, 0);
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
            { label: "TOTAL VOLUME",  value: fmtAmt(totalVolume),     color: "text-white" },
            { label: "COMPLETED",     value: fmtAmt(completedVolume), color: "text-emerald-400" },
            { label: "IN PROGRESS",   value: String(transactions.filter(t => t.status === "In Progress").length), color: "text-indigo-400" },
            { label: "CANCELLED",     value: String(transactions.filter(t => t.status === "Cancelled").length),  color: "text-slate-400" },
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
                {["TXN ID", "PROPERTY", "BUYER", "AGENT", "VALUE", "ESCROW", "DATE", "STATUS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No transactions found
                  </td>
                </tr>
              ) : filtered.map((txn) => {
                const StatusIcon = statusIcon[txn.status];
                return (
                  <tr key={txn.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">#{txn.id}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-white max-w-[180px]">
                      <span className="truncate block">{txn.property}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.buyer}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{txn.agent}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">{fmtAmt(txn.value)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        <Landmark className={`w-3 h-3 ${txn.escrow === "Released" ? "text-emerald-400" : txn.escrow === "Refunded" ? "text-slate-400" : "text-indigo-400"}`} />
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{txn.escrow}</span>
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
