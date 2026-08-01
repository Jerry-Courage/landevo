import React, { useState, useEffect, useCallback, useRef } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, UserCheck, Clock, CheckCircle2, XCircle, Eye,
  FileText, Upload, X, Download, ExternalLink, AlertCircle, Info,
} from "lucide-react";

interface Doc { name: string; url: string; contentType: string; }

interface KycRecord {
  id: number;
  status: "pending" | "in_review" | "approved" | "rejected";
  governmentIdType: string;
  governmentIdNumber: string;
  licenseNumber: string | null;
  documents: Doc[];
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

const GOV_ID_TYPES = [
  "National Identity Number (NIN)",
  "International Passport",
  "Driver's License",
  "Permanent Voter's Card (PVC)",
];

const statusConfig: Record<string, { bg: string; icon: React.ElementType; label: string; description: string }> = {
  pending:   { bg: "bg-amber-100 text-amber-800",     icon: Clock,        label: "Pending Review",  description: "Your submission has been received and is awaiting a commission officer." },
  in_review: { bg: "bg-blue-100 text-blue-800",       icon: Eye,          label: "Under Review",    description: "A commission officer is currently reviewing your identity documents." },
  approved:  { bg: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Verified",        description: "Your identity has been confirmed. A verified badge appears on your listings." },
  rejected:  { bg: "bg-red-100 text-red-800",         icon: XCircle,      label: "Rejected",        description: "Your submission was not approved. Please review the notes and resubmit." },
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GH", { month: "long", day: "numeric", year: "numeric" });
}

export default function AgentKYC() {
  const [existing, setExisting] = useState<KycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/agent-verifications", { credentials: "include" });
      if (res.ok) {
        const rows = await res.json() as KycRecord[];
        // Show the most recent that's not rejected — or the most recent overall
        const active = rows.find(r => r.status !== "rejected") ?? rows[0] ?? null;
        if (active) setExisting(active);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/storage/uploads", { method: "POST", body: form, credentials: "include" });
      if (res.ok) {
        const { uploadURL } = await res.json() as { uploadURL: string };
        setDocuments(prev => [...prev, { name: file.name, url: uploadURL, contentType: file.type || "application/octet-stream" }]);
      }
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idType || !idNumber.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/agent-verifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          governmentIdType: idType,
          governmentIdNumber: idNumber.trim(),
          licenseNumber: licenseNumber.trim() || undefined,
          documents,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        await load();
      }
    } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center text-muted-foreground text-sm">Loading…</div>
      </AppLayout>
    );
  }

  // Show status if there's an active/existing submission
  const showStatus = existing && existing.status !== "rejected";
  // Allow resubmission only after rejection
  const canResubmit = existing?.status === "rejected";

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-widest mb-1">IDENTITY VERIFICATION</p>
          <h1 className="text-2xl font-bold tracking-tight">Agent KYC Verification</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Submit your identity documents to receive a verified badge on your listings and build buyer trust.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 p-4 rounded-xl border bg-blue-50 border-blue-100">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Why get verified?</p>
            <p className="text-blue-700">A verified badge signals to buyers that your identity has been confirmed by the Land Commission. Verified agents receive more inquiries and close deals faster.</p>
          </div>
        </div>

        {/* Existing status card */}
        {showStatus && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-5">
              {(() => {
                const cfg = statusConfig[existing!.status];
                const Icon = cfg.icon;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${existing!.status === "approved" ? "bg-emerald-100" : "bg-amber-100"}`}>
                          <Icon className={`w-5 h-5 ${existing!.status === "approved" ? "text-emerald-700" : "text-amber-700"}`} />
                        </div>
                        <div>
                          <p className="font-bold text-base">{cfg.label}</p>
                          <p className="text-sm text-muted-foreground">{cfg.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full ${cfg.bg}`}>
                        <Icon className="w-3 h-3" /> {cfg.label.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">ID TYPE</p>
                        <p className="font-medium mt-0.5">{existing!.governmentIdType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">SUBMITTED</p>
                        <p className="font-medium mt-0.5">{fmt(existing!.submittedAt)}</p>
                      </div>
                      {existing!.notes && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-muted-foreground tracking-wider">COMMISSION NOTES</p>
                          <p className="mt-1 bg-muted/30 rounded p-2 text-sm leading-relaxed">{existing!.notes}</p>
                        </div>
                      )}
                    </div>

                    {existing!.documents.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">SUBMITTED DOCUMENTS</p>
                        <div className="space-y-1.5">
                          {existing!.documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </a>
                                <a href={doc.url} download={doc.name}>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Rejection: show resubmit form */}
        {(canResubmit || (!existing && !success)) && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                {canResubmit ? "Resubmit Verification" : "Submit Identity Documents"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {canResubmit && existing?.notes && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100 mb-5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Previous rejection reason</p>
                    <p>{existing.notes}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ID Type */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Government ID Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select ID type…</option>
                    {GOV_ID_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* ID Number */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    ID Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter your ID number"
                    required
                  />
                </div>

                {/* License number */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Real Estate License Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LASRETRAD-12345"
                  />
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Supporting Documents</Label>
                  <p className="text-xs text-muted-foreground">Upload scans of your ID card, certificate of occupancy, or any other supporting documents.</p>

                  {documents.length > 0 && (
                    <div className="space-y-1.5">
                      {documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{doc.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => setDocuments(prev => prev.filter((_, j) => j !== i))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={docInputRef}
                    className="hidden"
                    onChange={handleDocUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-dashed text-sm font-medium"
                    onClick={() => docInputRef.current?.click()}
                    disabled={uploadingDoc}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingDoc ? "Uploading…" : "Add Document"}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold bg-emerald-700 hover:bg-emerald-800"
                  disabled={submitting || !idType || !idNumber.trim()}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {submitting ? "Submitting…" : "Submit for Verification"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {success && !existing && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-emerald-700" />
            </div>
            <p className="font-bold text-lg">Submission received!</p>
            <p className="text-muted-foreground text-sm max-w-xs">Your KYC documents have been sent to the Land Commission for review. We'll notify you when a decision is made.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
