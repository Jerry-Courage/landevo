import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  HandCoins,
  User,
  Building2,
  CalendarDays,
  MessageSquare,
  Check,
  X,
  Loader2,
  InboxIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMyOffers,
  useAcceptOffer,
  useRejectOffer,
  getListMyOffersQueryKey,
  getGetAgentDashboardQueryKey,
} from "@workspace/api-client-react";
import type { Offer } from "@workspace/api-client-react";

type FilterStatus = "All" | "Pending" | "Accepted" | "Rejected" | "Withdrawn";

const FILTERS: FilterStatus[] = ["All", "Pending", "Accepted", "Rejected", "Withdrawn"];

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "accepted":
      return <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">Accepted</Badge>;
    case "pending":
      return <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100">Rejected</Badge>;
    case "withdrawn":
      return <Badge className="bg-slate-100 text-slate-600 border-none hover:bg-slate-100">Withdrawn</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OfferDrawer({
  offer,
  open,
  onClose,
  onAccept,
  onReject,
  isActing,
}: {
  offer: Offer | null;
  open: boolean;
  onClose: () => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  isActing: boolean;
}) {
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);

  if (!offer) return null;

  const isPending = offer.status === "pending";

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Offer Details</SheetTitle>
            <SheetDescription>
              Review this offer and take action if it's still pending.
            </SheetDescription>
          </SheetHeader>

          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground font-medium">Status</span>
            <StatusBadge status={offer.status} />
          </div>

          <Separator className="mb-6" />

          {/* Offer Amount */}
          <div className="bg-muted/40 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <HandCoins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Offer Amount</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(offer.amount)}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Buyer</p>
                <p className="text-sm font-semibold text-foreground">{offer.buyerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Property</p>
                <p className="text-sm font-semibold text-foreground">{offer.listingTitle}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Submitted</p>
                <p className="text-sm font-semibold text-foreground">{fmt(offer.createdAt)}</p>
              </div>
            </div>

            {offer.message && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Message from Buyer</p>
                  <p className="text-sm text-foreground bg-muted/40 rounded-md p-3 leading-relaxed">
                    {offer.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isPending && (
            <>
              <Separator className="mb-6" />
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Actions</p>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
                    disabled={isActing}
                    onClick={() => setConfirmAction("accept")}
                  >
                    {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive font-semibold"
                    disabled={isActing}
                    onClick={() => setConfirmAction("reject")}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Accepting will auto-reject all other pending offers on this listing.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Accept Confirm */}
      <AlertDialog open={confirmAction === "accept"} onOpenChange={(v) => !v && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              You're accepting <strong>{formatCurrency(offer.amount)}</strong> from{" "}
              <strong>{offer.buyerName}</strong>. All other pending offers on{" "}
              <strong>{offer.listingTitle}</strong> will be automatically rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                setConfirmAction(null);
                onAccept(offer.id);
              }}
            >
              Yes, accept offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirm */}
      <AlertDialog open={confirmAction === "reject"} onOpenChange={(v) => !v && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              You're rejecting the offer of <strong>{formatCurrency(offer.amount)}</strong> from{" "}
              <strong>{offer.buyerName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setConfirmAction(null);
                onReject(offer.id);
              }}
            >
              Yes, reject offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AgentOffers() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const { data: offers = [], isLoading } = useListMyOffers();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMyOffersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAgentDashboardQueryKey() });
  };

  const { mutate: acceptOffer, isPending: isAccepting } = useAcceptOffer({
    mutation: {
      onSuccess: () => {
        invalidate();
        setSelectedOffer(null);
      },
    },
  });

  const { mutate: rejectOffer, isPending: isRejecting } = useRejectOffer({
    mutation: {
      onSuccess: () => {
        invalidate();
        setSelectedOffer(null);
      },
    },
  });

  const isActing = isAccepting || isRejecting;

  const counts: Record<FilterStatus, number> = {
    All:       offers.length,
    Pending:   offers.filter((o) => o.status === "pending").length,
    Accepted:  offers.filter((o) => o.status === "accepted").length,
    Rejected:  offers.filter((o) => o.status === "rejected").length,
    Withdrawn: offers.filter((o) => o.status === "withdrawn").length,
  };

  const filtered =
    filter === "All" ? offers : offers.filter((o) => o.status === filter.toLowerCase());

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Offers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All offers received across your listings. Click any offer to review and act on it.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                filter === f
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === f
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Offers List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-lg gap-3">
            <InboxIcon className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium text-sm">
              {filter === "All" ? "No offers received yet." : `No ${filter.toLowerCase()} offers.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((offer) => (
              <button
                key={offer.id}
                className="w-full text-left bg-card border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                onClick={() => setSelectedOffer(offer)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={offer.status} />
                      <span className="text-xs text-muted-foreground">{fmt(offer.createdAt)}</span>
                    </div>
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {offer.listingTitle}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      From <span className="font-medium text-foreground">{offer.buyerName}</span>
                      {offer.message && (
                        <span className="ml-2 text-muted-foreground/60">· Has message</span>
                      )}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Offer</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(offer.amount)}</p>
                    {offer.status === "pending" && (
                      <p className="text-xs text-primary font-medium mt-1">Click to act →</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <OfferDrawer
        offer={selectedOffer}
        open={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onAccept={(id) => acceptOffer({ offerId: id })}
        onReject={(id) => rejectOffer({ offerId: id })}
        isActing={isActing}
      />
    </AppLayout>
  );
}
