import React, { useState, useRef } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Upload, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface UploadedDoc {
  name: string;
  type: string;
  url: string;
}

export default function Verification() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = async (files: FileList) => {
    setUploading(true);
    setUploadError("");
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("contentType", file.type);
      form.append("size", String(file.size));
      try {
        const res = await fetch("/api/storage/uploads", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as any).error ?? `Upload failed (${res.status})`);
        }
        const data = await res.json();
        const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
        setUploadedDocs((prev) => [
          ...prev,
          { name: file.name, type: ext, url: data.url },
        ]);
      } catch (e: any) {
        setUploadError(e.message ?? "Upload failed");
      }
    }
    setUploading(false);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verification Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your institutional credentials and professional standing.</p>
        </div>

        {/* Filters & Banner */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b w-full">
            <button className="px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">UNVERIFIED</button>
            <button className="px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">PENDING</button>
            <button className="px-4 py-3 text-sm font-bold text-primary border-b-2 border-primary">VERIFIED</button>
            <button className="px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">REJECTED</button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-sm">Institutional Verification Active</h3>
                <p className="text-green-700 text-sm mt-0.5">Your account is fully verified. You have full access to Landevo listing and escrow tools.</p>
              </div>
            </div>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100 font-semibold text-xs whitespace-nowrap">
              View Certificate
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-primary/20 shadow-sm">
              <CardContent className="p-0">
                <div className="bg-sidebar p-8 text-white flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <ShieldCheck className="w-16 h-16 text-primary-foreground mb-4 z-10 drop-shadow-md" />
                  <Badge className="bg-green-500 hover:bg-green-600 text-white border-none font-bold tracking-widest text-[10px] px-3 py-1 mb-4 z-10 shadow-sm">
                    CURRENT STATUS: VERIFIED
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2 z-10">Trusted Agent Badge</h2>
                  <p className="text-sidebar-foreground/80 text-sm max-w-md z-10">
                    You have successfully completed all institutional compliance checks with the State Land Commission.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-lg">Verification Documents</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">History of credentials submitted to the Land Commission.</p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-semibold h-9"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploading ? "Uploading…" : "Upload New"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs tracking-wider">DOCUMENT NAME</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider">TYPE</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider">STATUS</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-sm flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-muted-foreground" />
                        Estate_Agent_License_2024.pdf
                      </TableCell>
                      <TableCell className="text-sm">License</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] font-bold">APPROVED</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><ExternalLink className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-sm flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-muted-foreground" />
                        National_ID_Front.jpg
                      </TableCell>
                      <TableCell className="text-sm">ID Card</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] font-bold">APPROVED</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><ExternalLink className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-sm flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-muted-foreground" />
                        National_ID_Back.jpg
                      </TableCell>
                      <TableCell className="text-sm">ID Card</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] font-bold">APPROVED</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><ExternalLink className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {uploadedDocs.map((doc, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm flex items-center gap-2">
                      <FileIcon className="w-4 h-4 text-muted-foreground" />
                      {doc.name}
                    </TableCell>
                    <TableCell className="text-sm">{doc.type}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-bold text-amber-600 border-amber-400">PENDING</Badge></TableCell>
                    <TableCell>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><ExternalLink className="w-4 h-4" /></Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
                {uploadError && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-xs text-red-600 text-center py-3">{uploadError}</TableCell>
                  </TableRow>
                )}
                <div className="p-4 border-t text-center bg-muted/10">
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">View archived submissions</a>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 flex items-start gap-3 bg-card">
                <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">PRIVACY GUARANTEE</h4>
                  <p className="text-xs text-muted-foreground">All uploaded documents are AES-256 encrypted and stored on secure government servers.</p>
                </div>
              </div>
              <div className="border rounded-lg p-4 flex items-start gap-3 bg-card">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">NEED SUPPORT?</h4>
                  <p className="text-xs text-muted-foreground">Having issues with your verification? Contact <span className="font-semibold text-primary">support@landevo.com</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Verification Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">OVERALL COMPLETION</span>
                    <span className="text-sm font-bold text-foreground">75%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[75%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-5 mb-6">
                  <StepItem title="Personal Information" completed />
                  <StepItem title="Professional License" completed />
                  <StepItem title="Government ID" completed />
                  <StepItem title="Background Check" pending />
                </div>

                <Button className="w-full font-bold h-10" disabled>Continue Application</Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center font-bold text-white text-xl border-4 border-background shadow-sm mb-3">
                  AS
                </div>
                <h3 className="font-bold text-lg">Alex Sterling</h3>
                <p className="text-xs text-muted-foreground mb-4">Member since Oct 2023</p>
                
                <div className="w-full bg-muted/30 rounded p-3 text-left space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">LICENSE ID</span>
                    <span className="text-xs font-semibold text-foreground">AG-7742-8198</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">ISSUING AUTHORITY</span>
                    <span className="text-xs font-semibold text-foreground">Lagos State Land Commission</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block mb-1">ACCOUNT TYPE</span>
                    <Badge variant="outline" className="text-[10px] border-primary text-primary font-bold">PREMIUM AGENT</Badge>
                  </div>
                </div>

                <a href="/settings" className="text-xs font-bold text-primary hover:underline">Edit Profile Details</a>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Activity Log</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <ActivityItem action="Background Check Initiated" time="Today 10:45 AM" />
                  <ActivityItem action="National ID Approved" time="Yesterday 1:20 PM" />
                  <ActivityItem action="License Document Uploaded" time="Oct 12, 09:15 AM" />
                </div>
                <div className="p-4 border-t text-center bg-muted/10">
                  <Button variant="outline" size="sm" className="w-full font-semibold text-xs">View Full Audit Trail</Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function FileIcon(props: any) {
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

function StepItem({ title, completed, pending }: { title: string, completed?: boolean, pending?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${completed ? 'bg-green-500 border-green-500 text-white' : pending ? 'border-amber-400 text-amber-500' : 'border-border'}`}>
        {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
        {pending && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      </div>
      <span className={`text-sm font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</span>
    </div>
  );
}

function ActivityItem({ action, time }: { action: string, time: string }) {
  return (
    <div className="p-4 border-b last:border-0 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
      <div>
        <p className="text-sm font-semibold text-foreground leading-none mb-1.5">{action}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{time}</p>
      </div>
    </div>
  );
}
