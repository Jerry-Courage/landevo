import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin-layout";
import {
  Landmark, CheckCircle2, Clock, AlertTriangle, Search,
  Unlock, Lock, Download,
} from "lucide-react";
import { motion } from "framer-motion";

type EscrowStatus = "All" | "In Escrow" | "Pending Release" | "Released" | "Disputed" | "Refunded";

interface EscrowRow {
  id: string;
  transactionId: number;
  property: string;
  buyer: string;
  agent: string;
  value: number;
  status: string;
  held: string;
  commission: string;
  daysHeld: number;
}

const tabs: EscrowStatus[] = ["All", "In Escrow", "Pending Release", "Released", "Disputed", "Refunded"];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `₦ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

function statusStyle(s: string) {
  switch (s) {
    case "Pending Release": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "In Escrow": return "bg-indigo-500/15 text-indigo-400 border-indigo-500/20";
    case "Released": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "Disputed": return "bg-red-500/15 text-red-400 border-red-500/20";
    case "Refunded": return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    default: return "bg-white/8 text-white/50";
  }
}

export default function AdminEscrow() {
  const [escrows, setEscrows] = useState<EscrowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<EscrowStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);

  const fetchEscrows = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/escrows");
      if (res.ok) {
        const data = await res.json() as EscrowRow[];
        setEscrows(data);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEscrows(); }, [fetchEscrows]);

  const handleRelease = async (txId: number, rowId: string) => {
    setActionPending(rowId);
    try {
      await fetch(`/api/admin/escrows/${txId}/release`, { method: "PATCH" });
      await fetchEscrows();
    } finally { setActionPending(null); }
  };

  const handleDispute = async (txId: number, rowId: string) => {
    setActionPending(rowId);
    try {
      await fetch(`/api/admin/escrows/${txId}/dispute`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: "Dispute flagged by admin" }) });
      await fetchEscrows();
    } finally { setActionPending(null); }
  };

  const handleResolve = async (txId: number, rowId: string) => {
    setActionPending(rowId);
    try {
      await fetch(`/api/admin/escrows/${txId}/resolve`, { method: "PATCH" });
      await fetchEscrows();
    } finally { setActionPending(null); }
  };

  const filtered = escrows.filter((e) => {
    const matchTab = tab === "All" || e.status === tab;
    const matchSearch = !search || e.property.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) || e.buyer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const selectedEscrow = escrows.find((e) => e.id === selected);
  const totalHeld = escrows.filter(e => ["In Escrow", "Pending Release"].includes(e.status)).reduce((s, e) => s + e.value, 0);
  const totalReleased = escrows.filter(e => e.status === "Released").reduce((s, e) => s + e.value, 0);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>ESCROW MANAGEMENT</p>
            <h1 className="text-2xl font-bold text-white">Escrow Control</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Hold, review, and release escrow funds upon verified transaction completion.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "CURRENTLY HELD", value: fmt(totalHeld), icon: Lock, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
            { label: "RELEASED (ALL TIME)", value: fmt(totalReleased), icon: Unlock, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "PENDING RELEASE", value: escrows.filter(e => e.status === "Pending Release").length.toString(), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "ACTIVE DISPUTES", value: escrows.filter(e => e.status === "Disputed").length.toString(), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`} style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                  <Icon className={`w-4 h-4 ${s.color} opacity-70`} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-5">
          <div className={`flex flex-col gap-4 ${selectedEscrow ? "flex-1" : "w-full"}`}>
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
                    style={{
                      background: tab === t ? "rgba(99,102,241,0.2)" : "transparent",
                      color: tab === t ? "#a5b4fc" : "rgba(255,255,255,0.4)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
              {loading ? (
                <div className="py-16 flex items-center justify-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading escrow records…</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      {["TXN ID", "PROPERTY", "BUYER", "VALUE", "HELD SINCE", "STATUS", "COMMISSION", "ACTION"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => {
                      const isSelected = selected === e.id;
                      return (
                        <tr key={e.id} onClick={() => setSelected(isSelected ? null : e.id)}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isSelected ? "rgba(99,102,241,0.08)" : undefined }}
                          onMouseEnter={(el) => { if (!isSelected) el.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={(el) => { if (!isSelected) el.currentTarget.style.background = "transparent"; }}>
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">{e.id}</td>
                          <td className="px-5 py-3.5"><p className="text-sm font-semibold text-white max-w-[180px] truncate">{e.property}</p></td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{e.buyer}</td>
                          <td className="px-5 py-3.5 text-sm font-bold text-white">{fmt(e.value)}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{e.held}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle(e.status)}`}>{e.status}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold ${e.commission === "Cleared" ? "text-emerald-400" : e.commission === "On Hold" ? "text-red-400" : e.commission === "N/A" ? "text-white/30" : "text-amber-400"}`}>{e.commission}</span>
                          </td>
                          <td className="px-5 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                            {e.status === "Pending Release" && (
                              <button onClick={() => handleRelease(e.transactionId, e.id)}
                                disabled={actionPending === e.id}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
                                {actionPending === e.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                {actionPending === e.id ? "Releasing…" : "Release"}
                              </button>
                            )}
                            {e.status === "Disputed" && (
                              <button onClick={() => handleResolve(e.transactionId, e.id)}
                                disabled={actionPending === e.id}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                {actionPending === e.id ? "Resolving…" : "Resolve"}
                              </button>
                            )}
                            {e.status === "In Escrow" && (
                              <button onClick={() => handleDispute(e.transactionId, e.id)}
                                disabled={actionPending === e.id}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {actionPending === e.id ? "Flagging…" : "Flag Dispute"}
                              </button>
                            )}
                            {(e.status === "Released" || e.status === "Refunded") && (
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!loading && filtered.length === 0 && (
                <div className="py-16 flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Landmark className="w-10 h-10 opacity-30" />
                  <p className="text-sm">{escrows.length === 0 ? "No escrow transactions yet" : "No records match this filter"}</p>
                </div>
              )}
            </div>
          </div>

          {selectedEscrow && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="w-72 flex-shrink-0">
              <div className="rounded-xl border sticky top-0" style={{ background: "#13161f", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="p-4 border-b flex items-start justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedEscrow.id}</p>
                    <p className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: "rgba(255,255,255,0.4)" }}>{selectedEscrow.property}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ color: "rgba(255,255,255,0.3)" }} className="hover:text-white text-lg leading-none">×</button>
                </div>
                <div className="p-4 space-y-3">
                  {([
                    ["Buyer", selectedEscrow.buyer],
                    ["Agent", selectedEscrow.agent],
                    ["Value", fmt(selectedEscrow.value)],
                    ["Held Since", selectedEscrow.held],
                    ["Days Held", selectedEscrow.daysHeld === 0 ? "Closed" : `${selectedEscrow.daysHeld} days`],
                    ["Commission", selectedEscrow.commission],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
                      <span className="text-xs font-semibold text-white">{value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    {selectedEscrow.status === "Pending Release" && (
                      <>
                        <button onClick={() => handleRelease(selectedEscrow.transactionId, selectedEscrow.id)}
                          disabled={actionPending === selectedEscrow.id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <Unlock className="w-4 h-4" /> Release Escrow
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <Lock className="w-4 h-4" /> Keep on Hold
                        </button>
                      </>
                    )}
                    {selectedEscrow.status === "Disputed" && (
                      <button onClick={() => handleResolve(selectedEscrow.transactionId, selectedEscrow.id)}
                        disabled={actionPending === selectedEscrow.id}
                        className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Resolve Dispute
                      </button>
                    )}
                    {selectedEscrow.status === "In Escrow" && (
                      <>
                        <p className="text-xs py-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Awaiting commission clearance before release is available.
                        </p>
                        <button onClick={() => handleDispute(selectedEscrow.transactionId, selectedEscrow.id)}
                          disabled={actionPending === selectedEscrow.id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 mt-1"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                          <AlertTriangle className="w-4 h-4" />
                          {actionPending === selectedEscrow.id ? "Flagging…" : "Flag Dispute"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
