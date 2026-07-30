import React from "react";
import { Link } from "wouter";
import { Compass, Mail, Lock, Eye, Building2, ShieldCheck, Activity, Key, ArrowRightLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Login() {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Left Half - Branding */}
      <div className="hidden lg:flex w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Overlay */}
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
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border rounded-xl shadow-xl p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Enter your institutional credentials to access your dashboard.</p>
          </div>

          <div className="bg-muted p-1 rounded-lg flex mb-8">
            <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-background text-foreground shadow-sm">
              Login
            </button>
            <button className="flex-1 py-2 text-sm font-semibold rounded-md text-muted-foreground hover:text-foreground transition-colors">
              Sign Up
            </button>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="name@agency.gov" className="pl-10 h-11" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-10 pr-10 h-11" />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-input w-4 h-4 text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            <Link href="/dashboard" className="w-full">
              <Button className="w-full h-11 text-base font-semibold mt-2 group">
                Sign In 
                <ArrowRightLeft className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </form>

          <div className="mt-8 mb-6 flex items-center text-xs text-muted-foreground">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 font-semibold tracking-wider">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-11">
              Google SSO
            </Button>
            <Button variant="outline" className="flex-1 h-11 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary">
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
      </div>
    </div>
  );
}
