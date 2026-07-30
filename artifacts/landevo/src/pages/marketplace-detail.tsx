import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, MapPin, ShieldCheck, Ruler, Calendar, CheckCircle2, Lock, AlertTriangle, Phone, Mail, FileText, Check, MessageSquare } from "lucide-react";
import { mockListings, formatCurrency } from "@/lib/mock-data";
import { Link, useParams } from "wouter";

export default function PropertyDetail() {
  const params = useParams();
  const listingId = params.id || "LND-8821";
  const property = mockListings.find(l => l.id === listingId) || mockListings[0];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Breadcrumb */}
        <div className="bg-card border-b px-6 py-3 flex items-center text-sm font-medium text-muted-foreground">
          <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground">Property Details</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground">{property.id}</span>
        </div>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="success" className="bg-green-100 text-green-800 border-none font-bold text-xs px-2.5 py-1 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Property
                </Badge>
                <Badge variant="outline" className="font-semibold text-xs text-muted-foreground">
                  {property.id}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                {property.name}
              </h1>
              <div className="flex items-center text-lg text-muted-foreground font-medium">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Block 12, Plot 4, {property.location}
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
                <div className="aspect-[21/9] bg-gradient-to-b from-slate-700 to-slate-900 relative">
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider">
                    1 / 12 PHOTOS
                  </div>
                </div>
                <div className="p-3 bg-card flex gap-3 overflow-x-auto border-t">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-32 aspect-video bg-muted rounded border hover:border-primary cursor-pointer transition-colors flex-shrink-0" />
                  ))}
                  <div className="w-32 aspect-video bg-muted rounded border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors flex-shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">+8 More</span>
                  </div>
                </div>
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
                      <p className="font-bold text-sm text-foreground">{property.size}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Approx. 0.59 Acres</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none bg-muted/30 border-dashed">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-background rounded border text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-0.5">LAND USE</p>
                      <p className="font-bold text-sm text-foreground">{property.type}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">C of O Registered</p>
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
                      <p className="font-bold text-sm text-foreground">{property.date}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">12 days ago</p>
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
                    <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
                      <p>
                        This premium {property.size.toLowerCase()} {property.type.toLowerCase()} plot is situated in the highly sought-after development corridor of {property.location}. The land is fully dry, leveled, and ready for immediate development.
                      </p>
                      <p>
                        All relevant titles have been rigorously audited by the {property.state} Land Bureau and cleared for transfer through the Landevo platform. It holds a valid Certificate of Occupancy and approved layout plan.
                      </p>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                    <div>
                      <h4 className="font-bold mb-4 flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> KEY INFRASTRUCTURE
                      </h4>
                      <ul className="space-y-3">
                        {['Paved Access Road (Tarred)', 'Public Power Grid Connection', 'Structured Drainage System', 'Central Water Supply'].map((item, i) => (
                          <li key={i} className="flex items-start text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-3 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-4 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-primary" /> NEARBY LANDMARKS
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Central Business District</span>
                          <span className="font-semibold text-foreground">3.2 km</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">International Airport</span>
                          <span className="font-semibold text-foreground">14.5 km</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">General Hospital</span>
                          <span className="font-semibold text-foreground">1.8 km</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Shopping Mall</span>
                          <span className="font-semibold text-foreground">2.5 km</span>
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
                    <span className="text-muted-foreground font-medium flex items-center"><Map className="w-5 h-5 mr-2" /> Map Integration Pending</span>
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
                      <h2 className="text-3xl font-bold text-foreground mb-1">{formatCurrency(property.value)}</h2>
                      <p className="text-xs text-muted-foreground font-medium">Approx. ₦165,000 per sqm (at market rate)</p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100 mb-6">
                      <Lock className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-sm text-green-800">100% Digital Escrow</h5>
                        <p className="text-xs text-green-700 mt-1 leading-relaxed">Funds are held by the Landevo Institutional Escrow until verification completes.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full h-12 text-base font-bold shadow-md">START PURCHASE FLOW</Button>
                      <Button variant="outline" className="w-full h-12 font-bold border-2">MAKE AN OFFER</Button>
                    </div>

                    <div className="mt-6 pt-5 border-t space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Verification Fee</span>
                        <span className="font-semibold text-foreground">₦ 25,000</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Comm. Approval</span>
                        <span className="font-bold text-primary flex items-center"><Check className="w-4 h-4 mr-1" /> Obtained</span>
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
                        CO
                      </div>
                      <div>
                        <h4 className="font-bold text-base">Chidi Okafor</h4>
                        <p className="text-xs text-muted-foreground font-medium">Senior Land Consultant</p>
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
