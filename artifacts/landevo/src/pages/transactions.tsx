import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, ShieldCheck, MapPin, CheckCircle2, Circle, AlertCircle, Phone, Loader2, ArrowRightLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useListTransactions } from "@workspace/api-client-react";
import type { Transaction, TransactionStatus } from "@workspace/api-client-react";

const STATUS_ORDER: TransactionStatus[] = [
  "offer_made",
  "accepted",
  "escrow_opened",
  "funds_deposited",
  "verification_complete",
  "completed",
];

function statusLabel(s: TransactionStatus) {
  const map: Record<TransactionStatus, string> = {
    offer_made: "Offer Made",
    accepted: "Offer Accepted",
    escrow_opened: "Escrow Opened",
    funds_deposited: "Funds Deposited",
    verification_complete: "Verification Complete",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[s] ?? s;
}

function statusBadge(s: TransactionStatus) {
  if (s === "completed") return <Badge className="bg-green-100 text-green-800 border-green-200 font-bold text-[10px]">COMPLETED</Badge>;
  if (s === "cancelled") return <Badge className="bg-red-100 text-red-800 border-red-200 font-bold text-[10px]">CANCELLED</Badge>;
  if (s === "funds_deposited" || s === "escrow_opened") return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-[10px]">IN ESCROW</Badge>;
  return <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-[10px]">{statusLabel(s).toUpperCase()}</Badge>;
}

function stepIndex(status: TransactionStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function TransactionDetail({ tx }: { tx: Transaction }) {
  const currentStep = stepIndex(tx.status);
  const progress = tx.status === "completed" ? 100 : Math.round(((currentStep + 1) / STATUS_ORDER.length) * 100);

  return (
    <div className="flex flex-col min-h-full bg-muted/10">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {tx.escrowReference && (
              <Badge variant="outline" className="bg-background text-xs font-semibold">{tx.escrowReference}</Badge>
            )}
            {statusBadge(tx.status)}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{tx.listingTitle}</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                Started {formatDate(tx.createdAt)} • Managed by Landevo Institutional Escrow Services
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-semibold bg-background"><Download className="w-4 h-4 mr-2"/> Export Ledger</Button>
              <Button className="font-semibold bg-primary text-primary-foreground"><FileText className="w-4 h-4 mr-2"/> View Purchase Agreement</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Value Card */}
            <Card className="overflow-hidden shadow-sm border-t-4 border-t-amber-500">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">AGREED AMOUNT</p>
                    <h2 className="text-3xl font-bold text-foreground">{formatCurrency(tx.agreedAmount)}</h2>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">OFFER AMOUNT</p>
                    <h2 className="text-3xl font-bold text-primary">{formatCurrency(tx.offerAmount)}</h2>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-foreground">TRANSACTION PROGRESS</span>
                    <span className="text-sm font-bold text-primary">{progress}% Complete</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                {(tx.status === "accepted" || tx.status === "escrow_opened") && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-800 text-sm mb-1">Action Required: Awaiting Next Step</h5>
                      <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                        Current status: <strong>{statusLabel(tx.status)}</strong>. Proceed to open escrow and deposit funds.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm">Transaction Parties</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {tx.buyerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-none">{tx.buyerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Buyer <span className="text-green-600 ml-1">✓ Verified</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center text-xs font-bold text-white"><ShieldCheck className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-none">Landevo Commission</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Escrow Custodian</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                      {tx.agentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-none">{tx.agentName}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Listing Agent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm">Asset Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800"></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm leading-tight mb-1">{tx.listingTitle}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        Listing #{tx.listingId}
                      </div>
                      {tx.escrowReference && (
                        <Badge variant="outline" className="w-fit text-[10px] font-bold">{tx.escrowReference}</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-semibold h-9">View Listing →</Button>
                </CardContent>
              </Card>
            </div>

            {/* Financial Breakdown */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs tracking-wider">DESCRIPTION</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider text-right">AMOUNT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Offer Amount</TableCell>
                      <TableCell className="text-sm font-bold text-right text-green-600">+{formatCurrency(tx.offerAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Agreed Amount</TableCell>
                      <TableCell className="text-sm font-bold text-right">{formatCurrency(tx.agreedAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium text-muted-foreground">Escrow Fee (est. 0.5%)</TableCell>
                      <TableCell className="text-sm font-semibold text-right text-muted-foreground">-{formatCurrency(Math.round(tx.agreedAmount * 0.005))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium text-muted-foreground">Agent Commission (est. 5%)</TableCell>
                      <TableCell className="text-sm font-semibold text-right text-muted-foreground">-{formatCurrency(Math.round(tx.agreedAmount * 0.05))}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/20">
                      <TableCell className="text-sm font-bold">Estimated Release to Seller</TableCell>
                      <TableCell className="text-sm font-bold text-right text-primary">
                        {formatCurrency(Math.round(tx.agreedAmount * 0.945))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Process Workflow */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm">Process Workflow</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 relative">
                  <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border -z-10"></div>
                  
                  {STATUS_ORDER.map((step, i) => {
                    const isDone = i < currentStep || tx.status === "completed";
                    const isCurrent = step === tx.status && tx.status !== "completed";
                    return (
                      <div key={step} className={`flex items-start gap-4 ${!isDone && !isCurrent ? 'opacity-50' : ''}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-background border-2 border-primary text-primary ring-4 ring-background' : 'bg-background border-2 border-muted'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCurrent ? <Circle className="w-2.5 h-2.5 fill-primary" /> : null}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-none mb-1 ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                            {statusLabel(step).toUpperCase()}
                          </p>
                          {isCurrent && <p className="text-[10px] text-primary/70 font-semibold">In Progress</p>}
                          {isDone && <p className="text-[10px] text-muted-foreground font-semibold">Completed</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold h-11">
                Request Refund / Cancel
              </Button>
            </div>

            <Card className="bg-sidebar text-white shadow-sm border-none">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm mb-1">Need Assistance?</h4>
                  <p className="text-xs text-sidebar-foreground/70">Escrow Support Team</p>
                </div>
                <Button size="icon" variant="secondary" className="rounded-full bg-white text-sidebar hover:bg-white/90">
                  <Phone className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { data: transactions = [], isLoading } = useListTransactions();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = transactions.find((t) => t.id === selectedId) ?? transactions[0] ?? null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (transactions.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
          <ArrowRightLeft className="w-12 h-12 text-muted-foreground/40" />
          <h2 className="text-xl font-bold">No Transactions Yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Transactions are created when an offer is accepted. Browse the marketplace and submit an offer to get started.
          </p>
        </div>
      </AppLayout>
    );
  }

  // If multiple transactions, show a selector at the top
  return (
    <AppLayout>
      {transactions.length > 1 && (
        <div className="bg-card border-b px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-muted-foreground tracking-wider flex-shrink-0">TRANSACTIONS:</span>
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelectedId(tx.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                (selected?.id === tx.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:border-primary/50'
              }`}
            >
              {tx.listingTitle}
            </button>
          ))}
        </div>
      )}
      {selected && <TransactionDetail tx={selected} />}
    </AppLayout>
  );
}
