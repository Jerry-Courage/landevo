import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Lock, HelpCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useListTransactions, useUpdateTransactionStatus, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
  const stepIdx = STATUS_ORDER.indexOf(stepKey as never);
  const currIdx = STATUS_ORDER.indexOf(txStatus as never);
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
  const idx = STATUS_ORDER.indexOf(status as never);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
}

function EscrowCard({
  tx,
  onAdvance,
  advancing,
}: {
  tx: Transaction;
  onAdvance: (txId: number, nextStatus: string) => void;
  advancing: boolean;
}) {
  const pct = progressPct(tx.status);

  // Determine what action the buyer can take
  const nextAction: { label: string; nextStatus: string; description: string } | null =
    tx.status === "accepted"
      ? { label: "Open Escrow", nextStatus: "escrow_opened", description: "Initiate the escrow process to begin the secure transfer." }
      : tx.status === "escrow_opened"
      ? { label: "Confirm Funds Deposited", nextStatus: "funds_deposited", description: "Confirm that your funds have been transferred into escrow." }
      : null;

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
        {/* Amounts */}
        <div className="flex-1 p-6 md:border-r border-b md:border-b-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">AGREED AMOUNT</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(tx.agreedAmount ?? tx.offerAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">OFFER AMOUNT</p>
              <p className="text-xl font-bold text-muted-foreground">{formatCurrency(tx.offerAmount)}</p>
            </div>
          </div>

          {/* Step tracker */}
          <div className="space-y-3">
            {STATUS_STEPS.map((step) => {
              const state = getStepState(step.key, tx.status);
              return (
                <div key={step.key} className="flex items-center gap-3">
                  {state === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : state === "active" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary/20 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${state === "active" ? "text-foreground font-bold" : state === "done" ? "text-muted-foreground line-through" : "text-muted-foreground/60"}`}>
                    {step.label}
                  </span>
                  {state === "active" && (
                    <Badge className="ml-auto text-[9px] font-bold bg-primary/10 text-primary border-primary/20">CURRENT</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full md:w-64 p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground tracking-wider">YOUR NEXT STEP</p>

            {nextAction ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{nextAction.description}</p>
                <Button
                  className="w-full font-bold"
                  disabled={advancing}
                  onClick={() => onAdvance(tx.id, nextAction.nextStatus)}
                >
                  {advancing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {advancing ? "Processing…" : nextAction.label}
                </Button>
              </div>
            ) : tx.status === "funds_deposited" ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Awaiting Commission verification. We'll notify you when complete.
                </p>
              </div>
            ) : tx.status === "verification_complete" ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  Verified! Awaiting admin to release escrow funds.
                </p>
              </div>
            ) : tx.status === "completed" ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 font-medium leading-relaxed">
                  Transaction complete. Title has been transferred.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">No action required from you at this stage.</p>
              </div>
            )}
          </div>

          <Button variant="ghost" className="w-full text-xs font-medium text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4 mr-1" /> Need Help?
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function BuyerEscrow() {
  const queryClient = useQueryClient();
  const { data: transactions = [], isLoading } = useListTransactions();
  const [advancingId, setAdvancingId] = React.useState<number | null>(null);

  const updateStatus = useUpdateTransactionStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        setAdvancingId(null);
      },
      onError: () => setAdvancingId(null),
    },
  });

  const handleAdvance = (txId: number, nextStatus: string) => {
    setAdvancingId(txId);
    updateStatus.mutate({
      transactionId: txId,
      data: { status: nextStatus as never },
    });
  };

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
          {(transactions as Transaction[]).map((tx) => (
            <EscrowCard
              key={tx.id}
              tx={tx}
              onAdvance={handleAdvance}
              advancing={advancingId === tx.id}
            />
          ))}
        </div>
      </div>
    </BuyerLayout>
  );
}
