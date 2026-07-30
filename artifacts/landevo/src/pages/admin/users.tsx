import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin-layout";
import { Users, Search, Shield, Building2, User, CheckCircle2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

type Role = "agent" | "buyer" | "commission_admin" | "system_admin";
type RoleFilter = "All" | Role;

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  listingCount: number;
  transactionCount: number;
}

const roleIcon: Record<string, React.ElementType> = {
  agent: Shield, buyer: User, commission_admin: Building2, system_admin: Shield,
};
const roleLabel: Record<string, string> = {
  agent: "Agent", buyer: "Buyer", commission_admin: "Commission", system_admin: "Admin",
};
const roleStyle: Record<string, string> = {
  agent:            "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  buyer:            "bg-sky-500/15 text-sky-400 border-sky-500/20",
  commission_admin: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  system_admin:     "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

const tabs: RoleFilter[] = ["All", "agent", "buyer", "commission_admin"];
const tabLabels: Record<RoleFilter, string> = {
  All: "All", agent: "Agents", buyer: "Buyers", commission_admin: "Commission", system_admin: "Admins",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

export default function AdminUsers() {
  const [tab, setTab] = useState<RoleFilter>("All");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const filtered = users.filter((u) => {
    const matchTab = tab === "All" || u.role === tab;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const agentCount     = users.filter(u => u.role === "agent").length;
  const buyerCount     = users.filter(u => u.role === "buyer").length;
  const commissionCount = users.filter(u => u.role === "commission_admin").length;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>USER MANAGEMENT</p>
          <h1 className="text-2xl font-bold text-white">All Users</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Platform-wide view of all agents, buyers, and commission staff.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "AGENTS",     count: agentCount,     color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
            { label: "BUYERS",     count: buyerCount,     color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
            { label: "COMMISSION", count: commissionCount, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`} style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              placeholder="Search name or email..."
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
                {tabLabels[t]}
              </button>
            ))}
          </div>
          <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                {["USER", "ROLE", "JOINED", "LISTINGS", "TRANSACTIONS", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No users found
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const RoleIcon = roleIcon[u.role] ?? User;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(el) => (el.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">
                          {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${roleStyle[u.role] ?? roleStyle.buyer}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{fmt(u.createdAt)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{u.listingCount || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{u.transactionCount || "—"}</td>
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 rounded-md transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
