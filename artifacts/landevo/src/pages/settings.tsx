import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bell,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// ─── Types ───────────────────────────────────────────────────────────────────

type FullUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  notificationPreferences: Record<string, boolean> | null;
  createdAt: string;
};

const NOTIFICATION_ITEMS = [
  {
    key: "offer_received",
    label: "New offers on my listings",
    description: "Receive an alert when a buyer makes an offer.",
  },
  {
    key: "offer_accepted",
    label: "Offer accepted or rejected",
    description: "Updates when agents respond to your offers.",
  },
  {
    key: "listing_verified",
    label: "Verification status changes",
    description: "When a listing moves through the audit process.",
  },
  {
    key: "transaction_update",
    label: "Transaction milestones",
    description: "Escrow updates, fund confirmations, and completions.",
  },
  {
    key: "new_message",
    label: "New messages",
    description: "When another user sends you a message.",
  },
  {
    key: "system",
    label: "System notifications",
    description: "Platform announcements and maintenance alerts.",
  },
] as const;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [fullUser, setFullUser] = useState<FullUser | null>(null);

  // Load full profile (includes notificationPreferences)
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setFullUser(d.user))
      .catch(() => null);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your professional profile, preferences, and security
            settings.
          </p>
        </div>

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

          {/* ── Profile Tab ── */}
          <TabsContent
            value="profile"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Agent Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Avatar */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visible to buyers and government officials on your
                      listings.
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
                      <p className="text-sm font-bold text-foreground">
                        {user?.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className="capitalize text-xs font-semibold px-3 py-1 w-fit"
                      >
                        {user?.role?.replace(/_/g, " ") ?? "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="border-t pt-8">
                  <ProfileForm user={fullUser} onSaved={refreshUser} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Security Tab ── */}
          <TabsContent
            value="security"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PasswordChangeForm />
            <DeactivateForm onDeactivated={refreshUser} />
          </TabsContent>

          {/* ── Notifications Tab ── */}
          <TabsContent
            value="notifications"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <NotificationsForm
              savedPreferences={fullUser?.notificationPreferences ?? null}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// ─── Profile Form ────────────────────────────────────────────────────────────

function ProfileForm({
  user,
  onSaved,
}: {
  user: FullUser | null;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Populate once user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user?.id]);

  const isDirty =
    user && (name.trim() !== user.name || email.trim() !== user.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!user) return;

    const updates: Record<string, string> = {};
    if (name.trim() !== user.name) updates.name = name.trim();
    if (email.trim() !== user.email) updates.email = email.trim();

    if (!Object.keys(updates).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess(true);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-6 items-start"
    >
      <div className="w-full md:w-1/3">
        <h4 className="font-bold text-sm mb-1">Account Details</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your registered name and email address on Landevo.
        </p>
      </div>
      <div className="w-full md:w-2/3 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Full Name</label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuccess(false);
            }}
            className="max-w-md h-10"
            placeholder="Your full name"
            disabled={!user}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSuccess(false);
            }}
            className="max-w-md h-10"
            placeholder="your@email.com"
            disabled={!user}
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
            Profile updated successfully.
          </div>
        )}

        <Button
          type="submit"
          className="font-bold"
          disabled={loading || !isDirty || !user}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Password Form ────────────────────────────────────────────────────────────

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
    } catch (err) {
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
                  onChange={(e) => setCurrent(e.target.value)}
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
                  onChange={(e) => setNext(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="max-w-md h-10"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
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

// ─── Deactivate Form ──────────────────────────────────────────────────────────

function DeactivateForm({ onDeactivated }: { onDeactivated: () => Promise<void> }) {
  const [armed, setArmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeactivate = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/deactivate", {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Deactivation failed.");
      }
      await onDeactivated();
      // Session is destroyed server-side; redirect to login
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
      setArmed(false);
    }
  };

  return (
    <Card className="shadow-sm border-destructive/20">
      <CardHeader className="pb-4 border-b border-destructive/20">
        <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-2/3">
            <h4 className="font-bold text-sm mb-1">Deactivate Account</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Once deactivated, your listings will be hidden and your account
              will be locked. Contact the platform administrator to reinstate
              access.
            </p>
            {armed && (
              <p className="text-xs text-destructive font-semibold mt-3">
                ⚠ This action cannot be undone. Click "Confirm Deactivation" to
                proceed.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            )}
          </div>
          <div className="w-full md:w-1/3 flex flex-col gap-2 justify-end items-end">
            {!armed ? (
              <Button
                variant="destructive"
                className="font-bold"
                onClick={() => setArmed(true)}
              >
                Deactivate Account
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  className="font-bold w-full md:w-auto"
                  onClick={handleDeactivate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Deactivating…
                    </>
                  ) : (
                    "Confirm Deactivation"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="font-semibold w-full md:w-auto"
                  onClick={() => setArmed(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Notifications Form ───────────────────────────────────────────────────────

function NotificationsForm({
  savedPreferences,
}: {
  savedPreferences: Record<string, boolean> | null;
}) {
  // Default: everything on
  const defaultPrefs = Object.fromEntries(
    NOTIFICATION_ITEMS.map((item) => [item.key, true]),
  );

  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultPrefs);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Once we have saved prefs from the server, merge them in
  useEffect(() => {
    if (savedPreferences !== null) {
      setPrefs({ ...defaultPrefs, ...savedPreferences });
    }
  }, [savedPreferences]);

  const toggle = (key: string) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          (data as { error?: string }).error ?? "Failed to save preferences.",
        );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {error && (
              <span className="text-xs text-red-600 font-semibold">
                {error}
              </span>
            )}
            <Button
              size="sm"
              className="font-bold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-1">
        {NOTIFICATION_ITEMS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b last:border-0"
          >
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                prefs[key] ? "bg-primary" : "bg-muted"
              }`}
              role="switch"
              aria-checked={prefs[key]}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  prefs[key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
