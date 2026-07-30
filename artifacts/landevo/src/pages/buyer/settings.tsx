import React, { useState } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Mail, Info, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function useChangePassword() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsPending(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPending(false);
    }
  };

  return { changePassword, isPending, error, success };
}

export default function BuyerSettings() {
  const { user } = useAuth();

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwValidation, setPwValidation] = useState<string | null>(null);
  const { changePassword, isPending: changingPw, error: pwError, success: pwSuccess } =
    useChangePassword();

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwValidation(null);
    if (newPw.length < 8) {
      setPwValidation("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwValidation("New passwords do not match.");
      return;
    }
    changePassword(currentPw, newPw);
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "BM";

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your buyer identity and account security.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent gap-0 mb-6">
            {["profile", "security", "notifications"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-1 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground transition-colors capitalize"
              >
                {tab === "profile" ? "Personal Profile" : tab === "security" ? "Security" : "Notifications"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Personal Profile */}
          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your registered Landevo account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6 pb-6 border-b">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white shadow-sm flex items-center justify-center font-bold text-2xl text-primary">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{user?.name ?? "—"}</h3>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-green-50 text-green-700 border-green-200 font-bold"
                    >
                      VERIFIED BUYER
                    </Badge>
                  </div>
                </div>

                {/* Read-only fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      FULL NAME
                    </label>
                    <Input value={user?.name ?? ""} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={user?.email ?? ""} readOnly className="pl-9 bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      ROLE
                    </label>
                    <Input value="Buyer" readOnly className="bg-muted/50 capitalize" />
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-md p-3 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  To update your name or email, please contact Landevo support.
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>Identity documents and verification status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Identity Verified</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Your account has been verified by the Landevo compliance team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-0 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Keep your account secure with a strong password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  {/* Current password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      CURRENT PASSWORD
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        required
                        placeholder="Minimum 8 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPw && (
                      <div className="flex gap-1 mt-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              newPw.length > i * 3
                                ? newPw.length >= 12
                                  ? "bg-green-500"
                                  : newPw.length >= 8
                                  ? "bg-amber-500"
                                  : "bg-red-400"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {newPw.length >= 12 ? "Strong" : newPw.length >= 8 ? "Good" : "Weak"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">
                      CONFIRM NEW PASSWORD
                    </label>
                    <Input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                    />
                  </div>

                  {/* Errors / Success */}
                  {(pwValidation || pwError) && (
                    <p className="text-sm text-destructive font-medium">
                      {pwValidation ?? pwError}
                    </p>
                  )}
                  {pwSuccess && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm font-semibold">Password changed successfully.</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={changingPw}
                    className="font-bold px-6 bg-primary hover:bg-primary/90 h-10 shadow-sm"
                  >
                    {changingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what activity you hear about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Offer status updates", desc: "When your offers are reviewed or accepted", on: true },
                  { label: "Escrow milestones", desc: "Progress updates on active escrows", on: true },
                  { label: "Agent messages", desc: "New messages from agents", on: true },
                  { label: "New verified listings", desc: "Properties matching your preferences", on: true },
                  { label: "Platform announcements", desc: "News and feature updates from Landevo", on: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                        item.on ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          item.on ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BuyerLayout>
  );
}
