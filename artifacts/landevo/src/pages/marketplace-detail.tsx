import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, MapPin, ShieldCheck, Ruler, Calendar, CheckCircle2, Lock, AlertTriangle, Phone, FileText, MessageSquare, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Link, useParams } from "wouter";
import { useGetListing, useMakeOffer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListMyOffersQueryKey } from "@workspace/api-client-react";

export default function PropertyDetail() {
  const params = useParams();
  const listingId = Number(params.id);
  const queryClient = useQueryClient();

  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSuccess, setOfferSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: property, isLoading, error } = useGetListing(listingId, {
    query: { enabled: !!listingId && !isNaN(listingId) } as any,
  });

  const { mutate: submitOffer, isPending: isSubmitting } = useMakeOffer({
    mutation: {
      onSuccess: () => {
        setOfferSuccess(true);
        setOfferAmount("");
        setOfferMessage("");
        queryClient.invalidateQueries({ queryKey: getListMyOffersQueryKey() });
      },
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !property) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground font-medium">Property not found.</p>
          <Link href="/marketplace">
            <Button variant="outline">Back to Marketplace</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isVerified = property.status === "verified" || property.status === "active";

  const handleMakeOffer = () => {
    if (!offerAmount) return;
    submitOffer({
      listingId: property.id,
      data: {
        amount: Number(offerAmount),
        message: offerMessage || undefined,
      },
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Breadcrumb */}
        <div className="bg-card border-b px-6 py-3 flex items-center text-sm font-medium text-muted-foreground">
          <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground">Property Details</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground">#{property.id}</span>
        </div>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {isVerified ? (
                  <Badge variant="success" className="bg-green-100 text-green-800 border-none font-bold text-xs px-2.5 py-1 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Property
                  </Badge>
                ) : (
                  <Badge variant="warning" className="bg-amber-100 text-amber-800 border-none font-bold text-xs px-2.5 py-1 uppercase">
                    {property.status.replace(/_/g, ' ')}
                  </Badge>
                )}
                <Badge variant="outline" className="font-semibold text-xs text-muted-foreground">
                  #{property.id}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                {property.title}
              </h1>
              <div className="flex items-center text-lg text-muted-foreground font-medium">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {property.address ? `${property.address}, ` : ''}{property.city}, {property.state}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-semibold"><FileText className="w-4 h-4 mr-2"/> Download Docs</Button>
              <Button variant="outline" className="font-semibold">Share</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Hero Image */}
              <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
                <div className="aspect-[21/9] bg-gradient-to-b from-slate-700 to-slate-900 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider">
                    {property.images?.length ?? 0} PHOTOS
                  </div>
                </div>
                {property.images && property.images.length > 1 && (
                  <div className="p-3 bg-card flex gap-3 overflow-x-auto border-t">
                    {property.images.slice(1, 4).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-32 aspect-video rounded border object-cover flex-shrink-0" />
                    ))}
                    {property.images.length > 4 && (
                      <div className="w-32 aspect-video bg-muted rounded border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors flex-shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">+{property.images.length - 4} More</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-none bg-muted/30 border-dashed">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-background rounded border text-primary">
                      <Ruler className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-0.5">LAND SIZE</p>
                      <p className="font-bold text-sm text-foreground">{property.areaSqm?.toLocaleString() ?? '—'} sqm</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{property.propertyType}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none bg-muted/30 border-dashed">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-background rounded border text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-0.5">PROPERTY TYPE</p>
                      <p className="font-bold text-sm text-foreground capitalize">{property.propertyType}</p>
                      {isVerified && <p className="text-[10px] text-muted-foreground mt-0.5">C of O Registered</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none bg-muted/30 border-dashed">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-background rounded border text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-0.5">LISTED DATE</p>
                      <p className="font-bold text-sm text-foreground">{formatDate(property.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">VERIFICATION & DOCS</TabsTrigger>
                  <TabsTrigger value="map" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">LOCATION MAP</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <section>
                    <h3 className="text-lg font-bold mb-4">Property Description</h3>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      {property.description ? (
                        <p>{property.description}</p>
                      ) : (
                        <p>
                          This premium {property.areaSqm?.toLocaleString()} sqm {property.propertyType} plot is situated in {property.city}, {property.state}.
                          {isVerified && ' All relevant titles have been rigorously audited and cleared for transfer through the Landevo platform.'}
                        </p>
                      )}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                    <div>
                      <h4 className="font-bold mb-4 flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> KEY DETAILS
                      </h4>
                      <ul className="space-y-3">
                        {property.bedrooms != null && (
                          <li className="flex items-start text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-3 flex-shrink-0"></span>
                            {property.bedrooms} Bedrooms
                          </li>
                        )}
                        {property.bathrooms != null && (
                          <li className="flex items-start text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-3 flex-shrink-0"></span>
                            {property.bathrooms} Bathrooms
                          </li>
                        )}
                        <li className="flex items-start text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-3 flex-shrink-0"></span>
                          {property.areaSqm?.toLocaleString()} sqm total area
                        </li>
                        <li className="flex items-start text-sm text-muted-foreground capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-3 flex-shrink-0"></span>
                          {property.propertyType} property type
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-4 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-primary" /> LOCATION
                      </h4>
                      <ul className="space-y-3">
                        {property.address && (
                          <li className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Address</span>
                            <span className="font-semibold text-foreground text-right max-w-[60%]">{property.address}</span>
                          </li>
                        )}
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">City</span>
                          <span className="font-semibold text-foreground">{property.city}</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">State</span>
                          <span className="font-semibold text-foreground">{property.state}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="docs" className="py-6">
                  <p className="text-muted-foreground text-sm">Verification documents are securely held in escrow and available upon request initiation.</p>
                </TabsContent>
                <TabsContent value="map" className="py-6">
                  <div className="w-full h-[400px] bg-muted rounded-lg border flex items-center justify-center">
                    <span className="text-muted-foreground font-medium flex items-center"><MapPin className="w-5 h-5 mr-2" /> Map Integration Pending</span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                
                {/* Pricing Card */}
                <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">LISTING PRICE</p>
                      <h2 className="text-3xl font-bold text-foreground mb-1">{formatCurrency(property.price)}</h2>
                      {property.areaSqm && (
                        <p className="text-xs text-muted-foreground font-medium">
                          Approx. {formatCurrency(Math.round(property.price / property.areaSqm))} per sqm
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100 mb-6">
                      <Lock className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-sm text-green-800">100% Digital Escrow</h5>
                        <p className="text-xs text-green-700 mt-1 leading-relaxed">Funds are held by the Landevo Institutional Escrow until verification completes.</p>
                      </div>
                    </div>

                    {offerSuccess ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-bold text-sm text-green-800">Offer Submitted!</p>
                        <p className="text-xs text-green-700 mt-1">The agent will review your offer.</p>
                        <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setOfferSuccess(false)}>Make Another Offer</Button>
                      </div>
                    ) : property.status === "active" || property.status === "verified" ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">YOUR OFFER AMOUNT (₦)</p>
                          <Input
                            type="number"
                            placeholder={String(property.price)}
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">MESSAGE (optional)</p>
                          <Textarea
                            placeholder="Brief note to the agent..."
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            className="text-sm resize-none"
                            rows={2}
                          />
                        </div>
                        <Button
                          className="w-full h-12 text-base font-bold shadow-md"
                          onClick={handleMakeOffer}
                          disabled={isSubmitting || !offerAmount}
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          MAKE AN OFFER
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          This listing is currently <span className="font-bold capitalize">{property.status.replace(/_/g, ' ')}</span> and not accepting offers.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 pt-5 border-t space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Verification Fee</span>
                        <span className="font-semibold text-foreground">₦ 25,000</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Comm. Approval</span>
                        {isVerified ? (
                          <span className="font-bold text-primary flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Obtained</span>
                        ) : (
                          <span className="font-semibold text-amber-600">Pending</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Card */}
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm">Listing Professional</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-sidebar flex items-center justify-center font-bold text-white text-lg border-2 border-primary/20">
                        {property.agentName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AG'}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{property.agentName || 'Agent'}</h4>
                        <p className="text-xs text-muted-foreground font-medium">Land Consultant</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-bold text-primary tracking-wider">VERIFIED AGENT</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9"><MessageSquare className="w-3.5 h-3.5 mr-1.5"/> Message</Button>
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9"><Phone className="w-3.5 h-3.5 mr-1.5"/> Call</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-1">Direct Payment Warning</h5>
                    <p className="text-xs text-amber-700/90 leading-relaxed font-medium">Never pay directly to agents or private accounts. Only use the Landevo Escrow system to ensure your transaction is protected by the Commission.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
