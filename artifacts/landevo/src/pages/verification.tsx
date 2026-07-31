import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ExternalLink,
  Lock,
  Loader2,
  Send,
  ShieldX,
  ShieldAlert,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  useListVerifications,
  useListNotifications,
  useListListings,
  useSubmitListingForVerification,
  getListVerificationsQueryKey,
} from "@workspace/api-client-react";
import type { Verification, Listing } from "@workspace/api-client-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}

type OverallStatus = "unverified" | "pending" | "approved" | "rejected";

function computeOverallStatus(verifications: Verification[]): OverallStatus {
  if (!verifications.length) return "unverified";
  if (verifications.some((v) => v.status === "approved")) return "approved";
  if (
    verifications.some(
      (v) => v.status === "pending" || v.status === "in_review",
    )
  )
    return "pending";
  return "rejected";
}

type TabFilter = "all" | "pending" | "in_review" | "approved" | "rejected";

const TAB_LABELS: Record<TabFilter, string> = {
  all: "ALL",
  pending: "PENDING",
  in_review: "IN REVIEW",
  approved: "APPROVED",
  rejected: "REJECTED",
};

// ─── Status badge / banner config ───────────────────────────────────────────

function StatusBadge({ status }: { status: OverallStatus }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white border-none font-bold tracking-widest text-[10px] px-3 py-1 mb-4 z-10 shadow-sm">
          CURRENT STATUS: VERIFIED
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold tracking-widest text-[10px] px-3 py-1 mb-4 z-10 shadow-sm">
          CURRENT STATUS: UNDER REVIEW
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none font-bold tracking-widest text-[10px] px-3 py-1 mb-4 z-10 shadow-sm">
          CURRENT STATUS: REJECTED
        </Badge>
      );
    default:
      return (
        <Badge className="bg-muted text-muted-foreground border-none font-bold tracking-widest text-[10px] px-3 py-1 mb-4 z-10 shadow-sm">
          CURRENT STATUS: NOT VERIFIED
        </Badge>
      );
  }
}

function VerificationStatusRow({ status }: { status: Verification["status"] }) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="success" className="text-[10px] font-bold">
          APPROVED
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold text-amber-600 border-amber-400"
        >
          PENDING
        </Badge>
      );
    case "in_review":
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold text-blue-600 border-blue-400"
        >
          IN REVIEW
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="text-[10px] font-bold">
          REJECTED
        </Badge>
      );
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Verification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  const { data: verifications = [], isLoading: loadingVerifications } =
    useListVerifications();

  const { data: notifications = [], isLoading: loadingNotifications } =
    useListNotifications({ limit: 5 });

  // Fetch agent's own listings to populate the submit dialog
  const { data: agentListings = [], isLoading: loadingListings } =
    useListListings(undefined, { query: { enabled: submitDialogOpen } });

  // Only show listings that haven't already been submitted for verification
  const submittedListingIds = new Set(verifications.map((v) => v.listingId));
  const eligibleListings = agentListings.filter(
    (l: Listing) =>
      !submittedListingIds.has(l.id) &&
      (l.status === "active" || l.status === "draft" || l.status === "pending_verification"),
  );

  const submitMutation = useSubmitListingForVerification({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVerificationsQueryKey() });
        setSubmitDialogOpen(false);
        setSelectedListingId(null);
        setSubmitError("");
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to submit for verification.";
        setSubmitError(msg);
      },
    },
  });

  function handleSubmit() {
    if (!selectedListingId) return;
    setSubmitError("");
    submitMutation.mutate({ listingId: selectedListingId });
  }

  const overallStatus = computeOverallStatus(verifications);

  const filteredVerifications =
    activeTab === "all"
      ? verifications
      : verifications.filter((v) => v.status === activeTab);

  // Stats for sidebar
  const counts = verifications.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );


  // ── Status banner config ──
  const bannerConfig: Record<
    OverallStatus,
    { icon: React.ReactNode; bg: string; title: string; body: string }
  > = {
    approved: {
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50 border-green-200",
      title: "Institutional Verification Active",
      body: "Your account is fully verified. You have full access to Landevo listing and escrow tools.",
    },
    pending: {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200",
      title: "Verification In Progress",
      body: "Your submission is being reviewed by the Land Commission. You will be notified when a decision is made.",
    },
    rejected: {
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      bg: "bg-red-50 border-red-200",
      title: "Verification Rejected",
      body: "One or more of your submissions were rejected. Please review the notes and resubmit.",
    },
    unverified: {
      icon: <ShieldAlert className="w-6 h-6 text-muted-foreground" />,
      bg: "bg-muted/40 border-border",
      title: "Not Yet Verified",
      body: "Submit a listing for verification to begin the institutional compliance process.",
    },
  };

  const banner = bannerConfig[overallStatus];

  return (
    <AppLayout>
      {/* ── Submit for Verification Dialog ───────────────────────────────── */}
      <Dialog open={submitDialogOpen} onOpenChange={(o) => { setSubmitDialogOpen(o); if (!o) { setSelectedListingId(null); setSubmitError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Listing for Verification</DialogTitle>
            <DialogDescription>
              Choose one of your listings to send to the Land Commission for review.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {loadingListings ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading your listings…
              </div>
            ) : eligibleListings.length === 0 ? (
              <div className="text-center py-6">
                <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  All your listings have already been submitted for verification.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a new listing or wait for existing reviews to complete.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {eligibleListings.map((listing: Listing) => (
                  <button
                    key={listing.id}
                    onClick={() => setSelectedListingId(listing.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedListingId === listing.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{listing.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {listing.city}, {listing.state} · {listing.propertyType}
                        </p>
                      </div>
                      {selectedListingId === listing.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {submitError && (
              <p className="text-xs text-red-600 font-medium">{submitError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedListingId || submitMutation.isPending}
              onClick={handleSubmit}
            >
              {submitMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Submit</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verification Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your institutional credentials and professional standing.
          </p>
        </div>

        {/* Filters & Banner */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b w-full overflow-x-auto">
            {(Object.keys(TAB_LABELS) as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {TAB_LABELS[tab]}
                {tab !== "all" && counts[tab] ? (
                  <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5 font-bold">
                    {counts[tab]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div
            className={`border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${banner.bg}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/60 p-2 rounded-full">{banner.icon}</div>
              <div>
                <h3 className="font-bold text-sm">{banner.title}</h3>
                <p className="text-sm mt-0.5 text-muted-foreground">
                  {banner.body}
                </p>
              </div>
            </div>
            {overallStatus === "approved" && (
              <Button
                variant="outline"
                className="font-semibold text-xs whitespace-nowrap"
              >
                View Certificate
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero badge card */}
            <Card className="overflow-hidden border-primary/20 shadow-sm">
              <CardContent className="p-0">
                <div className="bg-sidebar p-8 text-white flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  {overallStatus === "approved" ? (
                    <ShieldCheck className="w-16 h-16 text-primary-foreground mb-4 z-10 drop-shadow-md" />
                  ) : overallStatus === "pending" ? (
                    <Clock className="w-16 h-16 text-amber-400 mb-4 z-10 drop-shadow-md" />
                  ) : overallStatus === "rejected" ? (
                    <ShieldX className="w-16 h-16 text-red-400 mb-4 z-10 drop-shadow-md" />
                  ) : (
                    <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4 z-10 drop-shadow-md" />
                  )}
                  <StatusBadge status={overallStatus} />
                  <h2 className="text-2xl font-bold mb-2 z-10">
                    {overallStatus === "approved"
                      ? "Trusted Agent Badge"
                      : overallStatus === "pending"
                        ? "Review In Progress"
                        : overallStatus === "rejected"
                          ? "Action Required"
                          : "Verification Pending"}
                  </h2>
                  <p className="text-sidebar-foreground/80 text-sm max-w-md z-10">
                    {overallStatus === "approved"
                      ? "You have successfully completed all institutional compliance checks with the State Land Commission."
                      : overallStatus === "pending"
                        ? "Your listing verification is currently being reviewed. This typically takes 2–5 business days."
                        : overallStatus === "rejected"
                          ? "Please review the rejection notes and submit updated listings for re-verification."
                          : "Submit a listing for verification to begin the compliance process with the Land Commission."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Requests Table */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-lg">Verification History</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Listing verifications submitted to the Land Commission.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-semibold h-9"
                  onClick={() => setSubmitDialogOpen(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Verification
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loadingVerifications ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading verifications…</span>
                  </div>
                ) : filteredVerifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                    <ShieldAlert className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {activeTab === "all"
                        ? "No verifications yet. Submit a listing for verification to get started."
                        : `No ${TAB_LABELS[activeTab].toLowerCase()} verifications.`}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs tracking-wider">
                          LISTING
                        </TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">
                          SUBMITTED
                        </TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">
                          STATUS
                        </TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">
                          REVIEWED
                        </TableHead>
                        <TableHead className="w-[80px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerifications.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium text-sm">
                            <div className="flex items-center gap-2">
                              <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {v.listingTitle}
                              </span>
                            </div>
                            {v.notes && (
                              <p className="text-xs text-muted-foreground mt-1 ml-6 italic">
                                {v.notes}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(v.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <VerificationStatusRow status={v.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {v.reviewedAt ? formatDate(v.reviewedAt) : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              asChild
                            >
                              <a href={`/listings/${v.listingId}`}>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 flex items-start gap-3 bg-card">
                <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">PRIVACY GUARANTEE</h4>
                  <p className="text-xs text-muted-foreground">
                    All uploaded documents are AES-256 encrypted and stored on
                    secure government servers.
                  </p>
                </div>
              </div>
              <div className="border rounded-lg p-4 flex items-start gap-3 bg-card">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">NEED SUPPORT?</h4>
                  <p className="text-xs text-muted-foreground">
                    Having issues with your verification? Contact{" "}
                    <span className="font-semibold text-primary">
                      support@landevo.com
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Verification Stats */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Verification Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {loadingVerifications ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-muted-foreground tracking-wider">
                          TOTAL SUBMISSIONS
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {verifications.length}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{
                            width:
                              verifications.length === 0
                                ? "0%"
                                : `${Math.round(((counts["approved"] ?? 0) / verifications.length) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {counts["approved"] ?? 0} of {verifications.length}{" "}
                        approved
                      </p>
                    </div>

                    <div className="space-y-3">
                      <StatItem
                        label="Approved"
                        count={counts["approved"] ?? 0}
                        color="text-green-600"
                        icon={
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        }
                      />
                      <StatItem
                        label="Pending"
                        count={counts["pending"] ?? 0}
                        color="text-amber-600"
                        icon={<Clock className="w-4 h-4 text-amber-500" />}
                      />
                      <StatItem
                        label="In Review"
                        count={counts["in_review"] ?? 0}
                        color="text-blue-600"
                        icon={<Clock className="w-4 h-4 text-blue-500" />}
                      />
                      <StatItem
                        label="Rejected"
                        count={counts["rejected"] ?? 0}
                        color="text-red-600"
                        icon={<XCircle className="w-4 h-4 text-red-500" />}
                      />
                    </div>

                    <Button
                      className="w-full font-bold h-10 mt-2"
                      variant="outline"
                      asChild
                    >
                      <a href="/listings">Submit a Listing</a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center font-bold text-white text-xl border-4 border-background shadow-sm mb-3">
                  {user ? getInitials(user.name) : "?"}
                </div>
                <h3 className="font-bold text-lg">
                  {user?.name ?? "Loading…"}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {user?.email}
                </p>

                <div className="w-full bg-muted/30 rounded p-3 text-left space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      ACCOUNT TYPE
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-primary text-primary font-bold mt-1"
                    >
                      {user?.role === "agent"
                        ? "AGENT"
                        : user?.role === "commission_admin"
                          ? "COMMISSION OFFICER"
                          : user?.role?.toUpperCase() ?? "—"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      VERIFICATION STATUS
                    </span>
                    <span className="text-xs font-semibold text-foreground capitalize">
                      {overallStatus === "unverified"
                        ? "Not verified"
                        : overallStatus === "in_review"
                          ? "In review"
                          : overallStatus.charAt(0).toUpperCase() +
                            overallStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      TOTAL LISTINGS VERIFIED
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {counts["approved"] ?? 0}
                    </span>
                  </div>
                </div>

                <a
                  href="/settings"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Edit Profile Details
                </a>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <ActivityItem
                        key={n.id}
                        action={n.title}
                        body={n.body}
                        time={timeAgo(n.createdAt)}
                        read={!!n.readAt}
                      />
                    ))}
                  </div>
                )}
                <div className="p-4 border-t text-center bg-muted/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-semibold text-xs"
                    asChild
                  >
                    <a href="/notifications">View Full Audit Trail</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function StatItem({
  label,
  count,
  color,
  icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{count}</span>
    </div>
  );
}

function ActivityItem({
  action,
  body,
  time,
  read,
}: {
  action: string;
  body: string;
  time: string;
  read: boolean;
}) {
  return (
    <div className="p-4 border-b last:border-0 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${read ? "bg-muted-foreground/40" : "bg-primary"}`}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground leading-none mb-1">
          {action}
        </p>
        <p className="text-xs text-muted-foreground mb-1 truncate">{body}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          {time}
        </p>
      </div>
    </div>
  );
}
