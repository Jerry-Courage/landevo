import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, UserCheck, UserX, Eye, Clock, CheckCircle2, XCircle,
  FileText, Download, ExternalLink, AlertCircle, Shield, Calendar, Mail,
  CreditCard, FileCheck,
} from "lucide-react";

type VerifStatus = "pending" | "in_review" | "approved" | "rejected";

interface Doc { name: string; url: string; contentType: string; }

interface AgentVerifDetail {
  id: number;
  agentId: number;
  agentName: string;
  agentEmail: string;
  agentIsVerified: boolean;
  agentJoinedAt: string;
  officerId: number | null;
  officerName: string | null;
  status: VerifStatus;
  governmentIdType: string;
  governmentIdNumber: string;
  licenseNumber: string | null;
  documents: Doc[];
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

const statusConfig: Record<VerifStatus, { bg: string; icon: React.ElementType; label: string }> = {
  pending:   { bg: "bg-amber-100 text-amber-800",     icon: Clock,        label: "Pending Review" },
  in_review: { bg: "bg-blue-100 text-blue-800",       icon: Eye,          label: "Under Review" },
  approved:  { bg: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Approved" },
  rejected:  { bg: "bg-red-100 text-red-800",         icon: XCircle,      label: "Rejected" },
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function apiPatch(url: string, body?: object) {
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  return res.json();
}

export default function AgentVerificationDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(params.id ?? "");

  const [v, setV] = useState<AgentVerifDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [approveNotes, setApproveNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [pending, setPending] = useState<"assign" | "approve" | "reject" | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent-verifications/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      setV(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAssign() {
    setPending("assign");
    try {
      const updated = await apiPatch(`/api/agent-verifications/${id}/assign`);
      setV(updated);
    } finally { setPending(null); }
  }

  async function handleApprove() {
    setPending("approve");
    try {
      await apiPatch(`/api/agent-verifications/${id}/approve`, { notes: approveNotes || undefined });
      navigate("/commission/verifications");
    } finally { setPending(null); }
  }

  async function handleReject() {
    if (!rejectNotes.trim()) return;
    setPending("reject");
    try {
      await apiPatch(`/api/agent-verifications/${id}/reject`, { notes: rejectNotes });
      navigate("/commission/verifications");
    } finally { setPending(null); }
  }

  if (loading) {
    return (
      <CommissionLayout>
        <div className="flex h-96 items-center justify-center text-muted-foreground text-sm">Loading…</div>
      </CommissionLayout>
    );
  }

  if (error || !v) {
    return (
      <CommissionLayout>
        <div className="p-8 flex flex-col items-center gap-3 py-24 text-muted-foreground">
          <AlertCircle className="w-10 h-10 opacity-30" />
          <p className="text-sm">Verification not found or access denied.</p>
          <Button variant="ghost" size="sm" onClick={() => navigate("/commission/verifications")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </CommissionLayout>
    );
  }

  const cfg = statusConfig[v.status];
  const StatusIcon = cfg.icon;
  const canAct = v.status === "pending" || v.status === "in_review";

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-0.5 flex-shrink-0" onClick={() => navigate("/commission/verifications")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">AGENT IDENTITY VERIFICATION</p>
              <h1 className="text-2xl font-bold tracking-tight">{v.agentName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5 font-mono">AV-{v.id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mt-1 flex-shrink-0 ${cfg.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: credentials + documents */}
          <div className="lg:col-span-2 space-y-5">

            {/* Agent info */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" /> Agent Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-lg text-emerald-800 flex-shrink-0">
                    {v.agentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{v.agentName}</span>
                      {v.agentIsVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          <UserCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" /> {v.agentEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Member since {fmt(v.agentJoinedAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">ID TYPE</p>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> {v.governmentIdType}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">ID NUMBER</p>
                    <p className="text-sm font-mono font-semibold">{v.governmentIdNumber}</p>
                  </div>
                  {v.licenseNumber && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">RE LICENSE NUMBER</p>
                      <p className="text-sm font-mono font-semibold flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-muted-foreground" /> {v.licenseNumber}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supporting documents */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Supporting Documents ({v.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {v.documents.length > 0 ? (
                  <div className="space-y-2">
                    {v.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-[11px] text-muted-foreground">{doc.contentType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                          <a href={doc.url} download={doc.name}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-7 h-7 opacity-20" />
                    <p className="text-xs">No documents uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: review info + actions */}
          <div className="space-y-5">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold">Review Info</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { icon: Calendar, label: "Submitted",  value: fmt(v.submittedAt) },
                  { icon: Calendar, label: "Reviewed",   value: fmt(v.reviewedAt) },
                  { icon: Shield,   label: "Officer",    value: v.officerName ?? "Unassigned" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </span>
                    <span className="text-xs font-medium text-right max-w-[150px]">{value}</span>
                  </div>
                ))}
                {v.notes && (
                  <div className="border-t pt-3">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">REVIEW NOTES</p>
                    <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 leading-relaxed">{v.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {canAct && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold">Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {v.status === "pending" && (
                    <Button
                      variant="outline"
                      className="w-full font-semibold text-sm h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={handleAssign}
                      disabled={pending === "assign"}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {pending === "assign" ? "Assigning…" : "Assign to Me"}
                    </Button>
                  )}

                  {/* Approve */}
                  {!showApprove ? (
                    <Button
                      className="w-full font-semibold text-sm h-9 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => { setShowApprove(true); setShowReject(false); }}
                    >
                      <UserCheck className="w-4 h-4 mr-2" /> Approve Agent
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                      <Label className="text-xs font-semibold text-emerald-800">Notes (optional)</Label>
                      <Textarea
                        value={approveNotes}
                        onChange={(e) => setApproveNotes(e.target.value)}
                        placeholder="Add approval notes…"
                        className="text-sm h-20 resize-none bg-white"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-emerald-700 hover:bg-emerald-800 font-semibold text-xs"
                          onClick={handleApprove} disabled={pending === "approve"}>
                          {pending === "approve" ? "Approving…" : "Confirm Approval"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowApprove(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Reject */}
                  {!showReject ? (
                    <Button
                      variant="outline"
                      className="w-full font-semibold text-sm h-9 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setShowReject(true); setShowApprove(false); }}
                    >
                      <UserX className="w-4 h-4 mr-2" /> Reject Submission
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                      <Label className="text-xs font-semibold text-red-800">Rejection reason <span className="text-red-500">*</span></Label>
                      <Textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Explain what is missing or incorrect…"
                        className="text-sm h-20 resize-none bg-white"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          className="flex-1 font-semibold text-xs text-red-600 border-red-300 hover:bg-red-100"
                          onClick={handleReject}
                          disabled={pending === "reject" || !rejectNotes.trim()}>
                          {pending === "reject" ? "Rejecting…" : "Confirm Rejection"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowReject(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CommissionLayout>
  );
}
