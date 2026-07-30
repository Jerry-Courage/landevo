import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Compass, Mail, Lock, Eye, EyeOff, Building2, ShieldCheck, Activity,
  ArrowRightLeft, Shield, User, ChevronDown, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

type Mode = "login" | "register";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"agent" | "buyer">("agent");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      // Redirect based on role — useAuth has already set the user,
      // App.tsx will handle the redirect once user is set.
      // We navigate manually here for immediacy.
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      const userRole = data?.user?.role;
      if (userRole === "buyer") {
        navigate("/buyer");
      } else if (userRole === "commission_admin") {
        navigate("/commission");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Left Half - Branding */}
      <div className="hidden lg:flex w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-sidebar/90 z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <Compass className="w-8 h-8 text-primary-foreground" />
          <span className="font-bold text-2xl tracking-tight">Landevo</span>
        </div>

        <div className="relative z-10 flex flex-col gap-10 max-w-lg mt-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              The Standard for Secure Land Transactions.
            </h1>
            <p className="text-lg text-sidebar-foreground/80 leading-relaxed">
              Connecting verified agents, government commissions, and serious buyers through an immutable digital escrow system.
            </p>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex gap-4">
              <div className="mt-1 bg-sidebar-primary/30 p-2 rounded-md h-fit">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Verified Listings</h3>
                <p className="text-sidebar-foreground/70 text-sm">All property titles are audited by the Land Commission before publication.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 bg-sidebar-primary/30 p-2 rounded-md h-fit">
                <Lock className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Escrow Security</h3>
                <p className="text-sidebar-foreground/70 text-sm">Funds are held securely until multi-stage verification is complete.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 bg-sidebar-primary/30 p-2 rounded-md h-fit">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Institutional Trust</h3>
                <p className="text-sidebar-foreground/70 text-sm">A direct bridge to official land management authorities and state registries.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-sidebar-border/30">
          <p className="text-sidebar-foreground/90 italic font-medium">
            "Landevo has reduced our verification turnaround time by 65% across three major commissions."
          </p>
          <p className="mt-2 text-sm text-sidebar-foreground/60 font-semibold tracking-wider">
            — DIRECTOR OF LAND SERVICES, LAGOS STATE
          </p>
        </div>
      </div>

      {/* Right Half - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Compass className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl tracking-tight">Landevo</span>
          </div>

          {/* Mode toggle */}
          <div className="flex border border-border rounded-lg p-1 mb-8 bg-muted/30">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === "login"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === "register"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {mode === "login"
                    ? "Sign in to access your Landevo workspace."
                    : "Join Landevo as an agent or buyer."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground tracking-wider">
                      FULL NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 h-11"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="agent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11"
                      required
                      autoFocus={mode === "login"}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wider">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground tracking-wider">
                      I AM JOINING AS
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("agent")}
                        className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                          role === "agent"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-semibold text-sm">Agent</span>
                        </div>
                        <span className="text-xs text-muted-foreground leading-snug">
                          List & manage properties
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("buyer")}
                        className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                          role === "buyer"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-semibold text-sm">Buyer</span>
                        </div>
                        <span className="text-xs text-muted-foreground leading-snug">
                          Browse & make offers
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold mt-1 group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {mode === "login" ? "Signing in…" : "Creating account…"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRightLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 mb-6 flex items-center text-xs text-muted-foreground">
                <div className="flex-1 border-t border-border" />
                <span className="px-4 font-semibold tracking-wider">OR CONTINUE WITH</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11" disabled>
                  Google SSO
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                  disabled
                >
                  <Shield className="w-4 h-4 mr-2" />
                  GovAuth
                </Button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                  <a href="#" className="hover:text-foreground">Privacy Policy</a>
                  <span>·</span>
                  <a href="#" className="hover:text-foreground">Terms of Service</a>
                  <span>·</span>
                  <a href="#" className="hover:text-foreground">Contact Support</a>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-[10px] font-bold tracking-wider">
                  <Activity className="w-3 h-3" />
                  SERVER STATUS: OPTIMAL
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
