import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, User, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your professional profile, preferences, and security settings.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0 mb-8 overflow-x-auto">
            {[
              { value: "profile", label: "Public Profile", icon: User },
              { value: "security", label: "Security", icon: Lock },
              { value: "notifications", label: "Notifications", icon: Bell },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Agent Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visible to buyers and government officials on your listings.
                    </p>
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-sidebar flex items-center justify-center font-bold text-white text-3xl border-4 border-background shadow-md">
                        {initials}
                      </div>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <p className="text-sm font-bold text-foreground">{user?.name}</p>
                      <Badge variant="secondary" className="capitalize text-xs font-semibold px-3 py-1 w-fit">
                        {user?.role?.replace(/_/g, " ") ?? "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Account Details</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your registered name and email address on Landevo.
                    </p>
                  </div>
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Full Name</label>
                      <Input defaultValue={user?.name ?? ""} className="max-w-md h-10" readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Email Address</label>
                      <Input type="email" defaultValue={user?.email ?? ""} className="max-w-md h-10" readOnly />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To update your name or email, contact your platform administrator.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <PasswordChangeForm />

            <Card className="shadow-sm border-destructive/20">
              <CardHeader className="pb-4 border-b border-destructive/20">
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-2/3">
                    <h4 className="font-bold text-sm mb-1">Deactivate Account</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Once deactivated, your listings will be hidden and your account will be locked. Contact the platform administrator to reinstate access.
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 flex justify-end">
                    <Button variant="destructive" className="font-bold" disabled>
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {[
                  { label: "New offers on my listings", description: "Receive an alert when a buyer makes an offer.", enabled: true },
                  { label: "Offer accepted or rejected", description: "Updates when agents respond to your offers.", enabled: true },
                  { label: "Verification status changes", description: "When a listing moves through the audit process.", enabled: true },
                  { label: "Transaction milestones", description: "Escrow updates, fund confirmations, and completions.", enabled: true },
                  { label: "New messages", description: "When another user sends you a message.", enabled: true },
                ].map(({ label, description, enabled }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <Badge variant={enabled ? "default" : "outline"} className="font-semibold text-xs">
                      {enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}

function PasswordChangeForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Security Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3">
              <h4 className="font-bold text-sm mb-1">Change Password</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Keep your account secure with a strong, unique password.
              </p>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="max-w-md h-10"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">New Password</label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="max-w-md h-10"
                  value={next}
                  onChange={e => setNext(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="max-w-md h-10"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 max-w-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 max-w-md">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Password changed successfully.
                </div>
              )}

              <Button type="submit" className="font-bold" disabled={loading}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
