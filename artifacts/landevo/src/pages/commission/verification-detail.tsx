import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import CommissionLayout from "@/components/commission-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, ShieldX, ArrowLeft, Clock, Eye, CheckCircle2, XCircle,
  FileText, Download, ExternalLink, MapPin, Ruler, BedDouble, Bath,
  Building2, DollarSign, UserCircle, Calendar, AlertCircle,
} from "lucide-react";
import {
  useGetVerification,
  useAssignVerification,
  useApproveVerification,
  useRejectVerification,
} from "@workspace/api-client-react";

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtPrice(p: string | number | null | undefined) {
  if (p == null) return "—";
  const n = typeof p === "string" ? parseFloat(p) : p;
  if (n >= 1_000_000_000) return `₦ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

const statusConfig: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
  pending:   { bg: "bg-amber-100 text-amber-800",     icon: Clock,        label: "Pending Review" },
  in_review: { bg: "bg-blue-100 text-blue-800",       icon: Eye,          label: "Under Review" },
  approved:  { bg: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Approved" },
  rejected:  { bg: "bg-red-100 text-red-800",         icon: XCircle,      label: "Rejected" },
};

export default function VerificationDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const verificationId = parseInt(params.id ?? "");

  const { data: v, refetch, isLoading, error } = useGetVerification(verificationId);
  const assign  = useAssignVerification();
  const approve = useApproveVerification();
  const reject  = useRejectVerification();

  const [approveNotes, setApproveNotes] = useState("");
  const [rejectNotes, setRejectNotes]   = useState("");
  const [photoIdx, setPhotoIdx]         = useState(0);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm]   = useState(false);

  async function handleAssign() {
    await assign.mutateAsync({ verificationId, data: {} });
    refetch();
  }

  async function handleApprove() {
    await approve.mutateAsync({ verificationId, data: { notes: approveNotes || undefined } });
    navigate("/commission/listing-verifications");
  }

  async function handleReject() {
    if (!rejectNotes.trim()) return;
    await reject.mutateAsync({ verificationId, data: { notes: rejectNotes } });
    navigate("/commission/listing-verifications");
  }

  if (isLoading) {
    return (
      <CommissionLayout>
        <div className="flex h-96 items-center justify-center text-muted-foreground text-sm">
          Loading verification…
        </div>
      </CommissionLayout>
    );
  }

  if (error || !v) {
    return (
      <CommissionLayout>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <AlertCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Verification not found or access denied.</p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/commission/listing-verifications")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to listing queue
            </Button>
          </div>
        </div>
      </CommissionLayout>
    );
  }

  const cfg = statusConfig[v.status] ?? statusConfig.pending;
  const StatusIcon = cfg.icon;
  const images: string[] = (v as any).listingImages ?? [];
  const documents: { name: string; url: string; contentType: string }[] = (v as any).listingDocuments ?? [];
  const canAct = v.status === "pending" || v.status === "in_review";

  return (
    <CommissionLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-0.5 flex-shrink-0" onClick={() => navigate("/commission/listing-verifications")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">VERIFICATION REVIEW</p>
              <h1 className="text-2xl font-bold tracking-tight">{(v as any).listingTitle ?? "—"}</h1>
              <p className="text-muted-foreground text-sm mt-0.5 font-mono">VER-{v.id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mt-1 ${cfg.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — media + documents */}
          <div className="lg:col-span-2 space-y-5">

            {/* Photo gallery */}
            <Card className="bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" /> Photos ({images.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {images.length > 0 ? (
                  <div>
                    {/* Main image */}
                    <div className="relative bg-muted aspect-[16/9] overflow-hidden">
                      <img
                        src={images[photoIdx]}
                        alt={`Photo ${photoIdx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                      />
                      {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                          {photoIdx + 1} / {images.length}
                        </div>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {images.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setPhotoIdx(i)}
                            className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${i === photoIdx ? "border-emerald-600" : "border-transparent opacity-60 hover:opacity-100"}`}
                          >
                            <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="w-8 h-8 opacity-20" />
                    <p className="text-xs">No photos uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
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

            {/* Listing description */}
            {(v as any).listingDescription && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold">Description</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{(v as any).listingDescription}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — listing details + actions */}
          <div className="space-y-5">

            {/* Listing details */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold">Listing Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider">PRICE</span>
                    <span className="text-sm font-bold text-emerald-700">{fmtPrice((v as any).listingPrice)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider">TYPE</span>
                    <span className="text-sm font-semibold capitalize">{((v as any).listingPropertyType ?? "—").replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider">AREA</span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                      {(v as any).listingAreaSqm != null ? `${parseFloat((v as any).listingAreaSqm).toLocaleString()} m²` : "—"}
                    </span>
                  </div>
                  {(v as any).listingBedrooms != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider">BEDS</span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-muted-foreground" /> {(v as any).listingBedrooms}
                      </span>
                    </div>
                  )}
                  {(v as any).listingBathrooms != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider">BATHS</span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-muted-foreground" /> {(v as any).listingBathrooms}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider">LOCATION</span>
                    <span className="text-sm font-medium flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{[(v as any).listingAddress, (v as any).listingCity, (v as any).listingState].filter(Boolean).join(", ") || (v as any).listingLocation || "—"}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission info */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold">Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { icon: UserCircle, label: "Agent", value: v.agentName },
                  { icon: Calendar, label: "Submitted", value: fmt(v.submittedAt) },
                  { icon: Calendar, label: "Reviewed", value: fmt(v.reviewedAt) },
                  { icon: UserCircle, label: "Officer", value: (v as any).officerName ?? "Unassigned" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </span>
                    <span className="text-xs font-medium text-right max-w-[150px]">{value ?? "—"}</span>
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

            {/* Actions */}
            {canAct && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold">Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Assign to me */}
                  {v.status === "pending" && (
                    <Button
                      variant="outline"
                      className="w-full font-semibold text-sm h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={handleAssign}
                      disabled={assign.isPending}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {assign.isPending ? "Assigning…" : "Assign to Me"}
                    </Button>
                  )}

                  {/* Approve */}
                  {!showApproveForm ? (
                    <Button
                      className="w-full font-semibold text-sm h-9 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => { setShowApproveForm(true); setShowRejectForm(false); }}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Approve Listing
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
                          onClick={handleApprove} disabled={approve.isPending}>
                          {approve.isPending ? "Approving…" : "Confirm Approval"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowApproveForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reject */}
                  {!showRejectForm ? (
                    <Button
                      variant="outline"
                      className="w-full font-semibold text-sm h-9 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setShowRejectForm(true); setShowApproveForm(false); }}
                    >
                      <ShieldX className="w-4 h-4 mr-2" /> Reject Listing
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                      <Label className="text-xs font-semibold text-red-800">Rejection reason <span className="text-red-500">*</span></Label>
                      <Textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Explain what needs to be corrected…"
                        className="text-sm h-20 resize-none bg-white"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          className="flex-1 font-semibold text-xs text-red-600 border-red-300 hover:bg-red-100"
                          onClick={handleReject} disabled={reject.isPending || !rejectNotes.trim()}>
                          {reject.isPending ? "Rejecting…" : "Confirm Rejection"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowRejectForm(false)}>
                          Cancel
                        </Button>
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
