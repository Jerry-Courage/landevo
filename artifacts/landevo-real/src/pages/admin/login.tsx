import React, { useState } from "react";
import { useLocation } from "wouter";
import { ShieldAlert, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data?.user?.role !== "system_admin") {
        setError("Access denied. This portal is restricted to system administrators.");
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        setLoading(false);
        return;
      }
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#0f1117" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">System Administration</h1>
            <p className="text-xs font-bold tracking-widest mt-1" style={{ color: "rgba(99,102,241,0.8)" }}>
              LANDEVO RESTRICTED ACCESS
            </p>
          </div>
        </div>

        {/* Warning */}
        <div
          className="flex items-start gap-3 rounded-lg p-3 mb-6 border"
          style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,100,100,0.85)" }}>
            Unauthorised access is prohibited and monitored. Only provisioned system administrators may proceed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              ADMIN EMAIL
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@landevo.ng"
                required
                autoFocus
                className="w-full h-11 pl-9 pr-4 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-11 pl-9 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm border"
              style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg text-sm font-bold transition-colors mt-2"
            style={{
              background: loading ? "rgba(99,102,241,0.5)" : "#4f46e5",
              color: "white",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating…
              </span>
            ) : (
              "Access Admin Portal"
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-1">
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            Not an admin?{" "}
            <a href="/login" className="hover:text-white/50 transition-colors">
              Return to main login
            </a>
          </p>
          <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.1)" }}>
            LANDEVO SYSTEM v1.0 · NODE: LAG-NG-01
          </p>
        </div>
      </motion.div>
    </div>
  );
}
