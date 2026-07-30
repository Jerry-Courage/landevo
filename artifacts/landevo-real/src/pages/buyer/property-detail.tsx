import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldCheck, MapPin, Calendar, CheckCircle2, ChevronRight, Download, FileText, Phone, MessageSquare, AlertCircle, Map } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";

export default function BuyerPropertyDetail() {
  return (
    <BuyerLayout>
      <div className="bg-[#F8F9FA] min-h-full">
        {/* Hero Section */}
        <div className="w-full h-[400px] relative bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 to-slate-900/90 z-0"></div>
          
          <div className="absolute top-6 left-6 z-10">
            <Badge variant="success" className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 text-xs shadow-lg flex items-center gap-1.5 border-none">
              <ShieldCheck className="w-4 h-4" /> VERIFIED PROPERTY
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white">
                <p className="text-sm font-bold tracking-widest text-teal-300 uppercase mb-2">COMMERCIAL LAND</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Prime Waterfront Commercial Plot</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Victoria Island, Lagos</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> 2,400 sqm</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Listed Oct 19, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Tabs */}
            <div className="flex border-b overflow-x-auto hide-scrollbar">
              {['OVERVIEW', 'VERIFICATION & DOCS', 'LOCATION MAP', 'NEIGHBORHOOD INSIGHT'].map((tab, i) => (
                <button key={tab} className={`px-6 py-4 text-sm font-bold tracking-wider whitespace-nowrap border-b-2 transition-colors ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Property Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  An exceptional opportunity to acquire a premium commercial plot located directly on the waterfront of Victoria Island. This 2,400 sqm parcel offers unparalleled visibility and access, making it ideal for a luxury hotel, corporate headquarters, or high-end mixed-use development. The land is fully sand-filled, compacted, and ready for immediate development.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm tracking-wider text-muted-foreground mb-3 uppercase">Key Infrastructure</h4>
                  <ul className="space-y-2">
                    {['Paved access road', 'Dedicated power transformer connection', 'Central sewage system line', 'High-speed fiber optic available'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wider text-muted-foreground mb-3 uppercase">Nearby Landmarks</h4>
                  <ul className="space-y-2">
                    {['Eko Atlantic City (2km)', 'Victoria Island Business District (0.5km)', 'Lagos Continental Hotel (1.2km)'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Docs Teaser */}
            <div className="bg-white border rounded-xl p-6 shadow-sm mt-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Verified Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Certificate of Occupancy</p>
                      <p className="text-[10px] text-green-600 font-bold">VERIFIED</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Registered Survey Plan</p>
                      <p className="text-[10px] text-green-600 font-bold">VERIFIED</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
            <Card className="shadow-lg border-border">
              <CardContent className="p-6">
                <p className="text-sm font-bold text-muted-foreground tracking-wider mb-1">LISTING PRICE</p>
                <h2 className="text-3xl font-bold text-foreground mb-6">₦ 245,000,000</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Your Offer Amount (₦)</label>
                    <Input type="text" defaultValue="245,000,000" className="h-12 font-bold text-lg" />
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 font-medium">Your offer will be held securely in escrow until the agent accepts.</p>
                  </div>
                  <Button className="w-full h-12 text-base font-bold bg-[#1B4332] hover:bg-[#1B4332]/90 shadow-md">
                    Submit Offer
                  </Button>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                  <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground font-bold">OR</span></div>
                </div>

                <Button variant="outline" className="w-full h-12 text-sm font-bold border-2">
                  Request Site Visit
                </Button>

                <div className="mt-6 pt-6 border-t flex items-start gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-green-800">100% Digital Escrow</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Funds only released upon verified title transfer and Land Commission approval.</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs font-bold p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">VERIFICATION FEE</span>
                  <span>₦ 25,000</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent Card */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-3">LISTING AGENT</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
                    CO
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Chidi Okafor</h4>
                    <p className="text-xs text-muted-foreground">Sterling Prime Real Estate</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs font-bold gap-2 bg-white">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs font-bold gap-2 bg-white">
                    <Phone className="w-4 h-4" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </BuyerLayout>
  );
}
