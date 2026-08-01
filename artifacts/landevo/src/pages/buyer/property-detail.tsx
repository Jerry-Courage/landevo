import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import BuyerLayout from "@/components/buyer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import {
  useGetListing,
  useMakeOffer,
  useCreateThread,
  getGetListingQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })
    .format(n)
    .replace("NGN", "₦");
}

const TYPE_LABELS: Record<string, string> = {
  land: "Land",
  residential: "Residential",
  commercial: "Commercial",
  apartment: "Apartment",
};

const GRADIENTS = [
  "from-teal-900 to-slate-800",
  "from-slate-800 to-green-900",
  "from-slate-700 to-emerald-900",
];

export default function BuyerPropertyDetail() {
  const params = useParams<{ id: string }>();
  const listingId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: listing, isLoading, error } = useGetListing(listingId, {
    query: { enabled: !isNaN(listingId) && listingId > 0, queryKey: getGetListingQueryKey(listingId) },
  });

  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSuccess, setOfferSuccess] = useState(false);

  const { mutate: makeOffer, isPending: submittingOffer, error: offerError } = useMakeOffer({
    mutation: {
      onSuccess: () => {
        setOfferSuccess(true);
        qc.invalidateQueries({ queryKey: ["/api/offers"] });
      },
    },
  });

  const { mutate: createThread, isPending: startingChat } = useCreateThread({
    mutation: {
      onSuccess: () => {
        navigate("/buyer/messages");
      },
    },
  });

  function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    const amount = parseFloat(offerAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) return;
    makeOffer({
      listingId: listing.id,
      data: { amount, message: offerMessage || undefined },
    });
  }

  function handleMessageAgent() {
    if (!listing) return;
    createThread({
      data: {
        recipientId: listing.agentId,
        listingId: listing.id,
        initialMessage: `Hello, I'm interested in "${listing.title}". Could you provide more information?`,
      },
    });
  }

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading property…
        </div>
      </BuyerLayout>
    );
  }

  if (error || !listing) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <AlertCircle className="w-10 h-10 text-destructive mb-3" />
          <p className="font-bold text-lg">Property not found</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            This listing may have been removed or is no longer available.
          </p>
          <Button variant="outline" onClick={() => navigate("/buyer/browse")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  const isAvailable = listing.status === "active" || listing.status === "verified";
  const agentInitials = listing.agentName
    ? listing.agentName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "??";

  return (
    <BuyerLayout>
      <div className="bg-[#F8F9FA] min-h-full">
        {/* Hero */}
        <div className="w-full h-[360px] relative bg-slate-900">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[listing.id % GRADIENTS.length]}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />

          <div className="absolute top-5 left-5 z-10">
            <button
              onClick={() => navigate("/buyer/browse")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Browse
            </button>
          </div>

          <div className="absolute top-5 right-5 z-10">
            {isAvailable ? (
              <Badge className="bg-green-500 text-white border-none shadow-lg font-bold px-3 py-1 flex items-center gap-1.5 hover:bg-green-500">
                <ShieldCheck className="w-4 h-4" /> VERIFIED
              </Badge>
            ) : (
              <Badge className="bg-amber-500 text-white border-none shadow-lg font-bold px-3 py-1 hover:bg-amber-500">
                {listing.status === "under_offer" ? "Under Offer" : listing.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 z-10">
            <div className="max-w-7xl mx-auto text-white">
              <p className="text-sm font-bold tracking-widest text-teal-300 uppercase mb-2">
                {TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {listing.city}, {listing.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> {listing.areaSqm} sqm
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Listed {new Date(listing.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          {/* Left content */}
          <div className="flex-1 space-y-8">
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Property Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {listing.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
                <div>
                  <h4 className="font-bold text-xs tracking-wider text-muted-foreground mb-3 uppercase">
                    Property Details
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Area: {listing.areaSqm} sqm
                    </li>
                    <li className="flex items-start gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Type: {TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                    </li>
                    {listing.bedrooms != null && (
                      <li className="flex items-start gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        Bedrooms: {listing.bedrooms}
                      </li>
                    )}
                    {listing.bathrooms != null && (
                      <li className="flex items-start gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        Bathrooms: {listing.bathrooms}
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-wider text-muted-foreground mb-3 uppercase">
                    Location
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {listing.address}
                    </li>
                    <li className="flex items-start gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {listing.city}, {listing.state}
                    </li>
                    {listing.location && (
                      <li className="flex items-start gap-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {listing.location}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
            {/* Offer card */}
            <Card className="shadow-lg border-border">
              <CardContent className="p-6">
                <p className="text-sm font-bold text-muted-foreground tracking-wider mb-1">
                  LISTING PRICE
                </p>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  {formatCurrency(listing.price)}
                </h2>

                {offerSuccess ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 text-sm">Offer submitted!</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        The agent will review your offer and respond shortly.
                      </p>
                    </div>
                  </div>
                ) : isAvailable ? (
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        YOUR OFFER AMOUNT (₦)
                      </label>
                      <Input
                        type="number"
                        placeholder={String(listing.price)}
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        required
                        min={1}
                        className="h-12 font-bold text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        MESSAGE TO AGENT (OPTIONAL)
                      </label>
                      <textarea
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        rows={2}
                        placeholder="Include any questions or conditions…"
                        className="flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-primary/80 font-medium">
                        Your offer will be held securely in escrow until the agent accepts.
                      </p>
                    </div>
                    {offerError && (
                      <p className="text-sm text-destructive font-medium">
                        {(offerError as any)?.message ?? "Failed to submit offer. Please try again."}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={submittingOffer}
                      className="w-full h-12 text-base font-bold bg-[#1B4332] hover:bg-[#1B4332]/90 shadow-md"
                    >
                      {submittingOffer && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit Offer
                    </Button>
                  </form>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="font-bold text-amber-800 text-sm">
                      {listing.status === "under_offer"
                        ? "This property is currently under offer"
                        : "This listing is not currently accepting offers"}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t flex items-start gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-green-800">100% Digital Escrow</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Funds only released upon verified title transfer and Land Commission approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent card */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">
                  LISTING AGENT
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-white shadow-sm flex items-center justify-center font-bold text-white">
                    {agentInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{listing.agentName}</h4>
                    <p className="text-xs text-muted-foreground">Agent</p>
                    {(listing as any).agentIsVerified && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-[10px] font-bold text-emerald-600 tracking-wider">VERIFIED AGENT</span>
                      </div>
                    )}
                  </div>
                </div>
                {user && user.id !== listing.agentId && (
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold gap-2 bg-white"
                    onClick={handleMessageAgent}
                    disabled={startingChat}
                  >
                    {startingChat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    Message Agent
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
