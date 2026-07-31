import React, { useState } from "react";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User, Lock, Bell, Shield, CheckCircle2, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "access", label: "Access", icon: Shield },
] as const;

type Tab = typeof TABS[number]["id"];

export default function CommissionSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPwError(data.message ?? "Failed to update password.");
        return;
      }
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch {
      setPwError("Network error. Please try again.");
    }
  };

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">ACCOUNT MANAGEMENT</p>
          <h1 className="text-2xl font-bold tracking-tight">Commission Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your commission profile, credentials, and notification preferences.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-emerald-700/10 text-emerald-800 font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {activeTab === "profile" && (
              <>
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base">Commission Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xl flex-shrink-0">
                        {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "LC"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user?.name ?? "Commission Admin"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <Badge className="mt-1.5 text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold">
                          Commission Admin
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground tracking-wider">FULL NAME</label>
                          <Input defaultValue={user?.name ?? ""} className="h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground tracking-wider">COMMISSION ID</label>
                          <Input defaultValue={`CMN-${String(user?.id ?? "001").padStart(3, "0")}`} className="h-10 bg-muted/30" readOnly />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground tracking-wider">OFFICIAL EMAIL</label>
                        <Input type="email" defaultValue={user?.email ?? ""} className="h-10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground tracking-wider">PHONE</label>
                          <Input type="tel" placeholder="+234 800 000 0000" className="h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground tracking-wider">JURISDICTION</label>
                          <Input defaultValue="Federal / All States" className="h-10" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    className="bg-emerald-700 hover:bg-emerald-800 font-semibold"
                    onClick={handleSave}
                  >
                    {saved ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Saved
                      </span>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-base">Security & Password</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Session Active</p>
                      <p className="text-xs text-emerald-700/80 mt-0.5">Your commission session is authenticated and secure.</p>
                    </div>
                  </div>

                  <div className="border-t pt-5 space-y-4">
                    <h4 className="text-sm font-bold">Change Password</h4>

                    {pwError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-medium">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground tracking-wider">CURRENT PASSWORD</label>
                      <div className="relative max-w-md">
                        <Input
                          type="password"
                          placeholder="Current password"
                          className="h-10 pr-10"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground tracking-wider">NEW PASSWORD</label>
                      <div className="relative max-w-md">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          className="h-10 pr-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground tracking-wider">CONFIRM NEW PASSWORD</label>
                      <div className="relative max-w-md">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat new password"
                          className="h-10 pr-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-end">
                    <Button className="bg-emerald-700 hover:bg-emerald-800 font-semibold" onClick={handlePasswordChange}>
                      {pwSaved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Updated</span> : "Update Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { label: "New agent verification submitted", desc: "When an agent submits credentials for review", enabled: true },
                    { label: "Listing audit required", desc: "When a property listing is awaiting your review", enabled: true },
                    { label: "Commission activity alerts", desc: "When a submission is approved or rejected", enabled: false },
                    { label: "Priority escalations", desc: "When a submission is marked high priority", enabled: true },
                    { label: "Weekly summary digest", desc: "A weekly report of commission activity and pending items", enabled: true },
                    { label: "System alerts", desc: "Automated system events and duplicate title detections", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-10 h-5 bg-muted rounded-full peer-checked:bg-emerald-700 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
                      </label>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-end">
                    <Button className="bg-emerald-700 hover:bg-emerald-800 font-semibold" onClick={handleSave}>
                      {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved</span> : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "access" && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-base">Access & Permissions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Elevated Access Role</p>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        Commission admins are provisioned directly by the Director. Contact the system administrator to modify access.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { permission: "Review agent verifications", granted: true },
                      { permission: "Approve & reject listings", granted: true },
                      { permission: "View activity log", granted: true },
                      { permission: "Export commission reports", granted: true },
                      { permission: "Modify system configuration", granted: false },
                    ].map((p) => (
                      <div key={p.permission} className="flex items-center justify-between py-2.5 border-b last:border-0">
                        <span className="text-sm font-medium">{p.permission}</span>
                        {p.granted ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Granted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                            Restricted
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CommissionLayout>
  );
}
