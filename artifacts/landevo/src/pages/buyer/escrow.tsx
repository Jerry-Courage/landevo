import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Lock, HelpCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListTransactions } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })
    .format(n)
    .replace("NGN", "₦");
}

const STATUS_STEPS = [
  { key: "accepted", label: "Offer Accepted" },
  { key: "escrow_opened", label: "Escrow Opened" },
  { key: "funds_deposited", label: "Funds Deposited" },
  { key: "verification_complete", label: "Commission Verified" },
  { key: "completed", label: "Title Transferred" },
] as const;

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function getStepState(stepKey: string, txStatus: string) {
  const stepIdx = STATUS_ORDER.indexOf(stepKey as any);
  const currIdx = STATUS_ORDER.indexOf(txStatus as any);
  if (stepIdx < currIdx) return "done";
  if (stepIdx === currIdx) return "active";
  return "pending";
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    accepted: { label: "Offer Accepted", cls: "bg-blue-100 text-blue-800 border-blue-200" },
    escrow_opened: { label: "Escrow Opened", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    funds_deposited: { label: "Funds Deposited", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    verification_complete: { label: "Verification Complete", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    completed: { label: "Completed", cls: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800 border-red-200" },
  };
  const m = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-700" };
  return (
    <Badge variant="outline" className={`${m.cls} hover:${m.cls} font-bold text-xs`}>
      {m.label}
    </Badge>
  );
}

function progressPct(status: string) {
  const idx = STATUS_ORDER.indexOf(status as any);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
}

function EscrowCard({ tx }: { tx: Transaction }) {
  const pct = progressPct(tx.status);

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <div className="border-b bg-muted/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-bold bg-white text-xs">
              {tx.escrowReference ?? `TXN-${tx.id}`}
            </Badge>
            {statusBadge(tx.status)}
          </div>
          <h3 className="font-bold text-lg">{tx.listingTitle}</h3>
        </div>
        <div className="flex flex-col md:items-end">
          <span className="text-xs font-bold text-muted-foreground mb-1">PROGRESS</span>
          <span className="font-bold text-lg text-primary">{pct}% Complete</span>
        </div>
      </div>

      <div className="bg-primary/5 px-6 py-1">
        <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden my-3">
          <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left: amounts */}
        <div className="flex-1 p-6 md:border-r border-b md:border-b-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">
                AGREED AMOUNT
              </p>
              <p className="font-bold text-lg">{formatCurrency(tx.agreedAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">
                OFFER AMOUNT
              </p>
              <p className="font-bold text-lg text-primary">{formatCurrency(tx.offerAmount)}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
              MANAGING AGENT
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                {(tx.agentName ?? "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold">{tx.agentName}</p>
                <p className="text-xs text-muted-foreground">Agent</p>
              </div>
            </div>
          </div>

          {tx.status === "completed" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-bold text-green-800">
                Transaction complete. Title has been transferred.
              </p>
            </div>
          )}
        </div>

        {/* Right: timeline */}
        <div className="w-full md:w-[300px] bg-card p-6 flex flex-col">
          <h4 className="font-bold text-sm tracking-wider text-muted-foreground mb-6">
            PROCESS STEPS
          </h4>

          <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3 before:h-full before:w-0.5 before:bg-border mb-6">
            {STATUS_STEPS.map((step) => {
              const state = getStepState(step.key, tx.status);
              return (
                <div key={step.key} className="relative flex items-center gap-4 pl-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                      state === "done"
                        ? "border-green-500 bg-white"
                        : state === "active"
                        ? "border-amber-500 bg-white"
                        : "border-muted bg-muted"
                    }`}
                  >
                    {state === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {state === "active" && (
                      <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                    )}
                    {state === "pending" && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        state === "active"
                          ? "text-amber-600"
                          : state === "pending"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {state === "done"
                        ? new Date(tx.updatedAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : state === "active"
                        ? "In Progress"
                        : "Locked"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto">
            <Button variant="ghost" className="w-full text-xs font-medium text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-4 h-4 mr-1" /> Need Help?
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BuyerEscrow() {
  const { data: transactions = [], isLoading } = useListTransactions();

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Escrow Tracker</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your land purchase escrow transactions securely.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading transactions…
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldCheck className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No active escrows</p>
              <p className="text-sm text-muted-foreground mt-1">
                When an agent accepts your offer, your escrow will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {transactions.map((tx: Transaction) => (
            <EscrowCard key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </BuyerLayout>
  );
}
