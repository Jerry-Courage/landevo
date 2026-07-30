import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Map, List, MapPin, ShieldCheck, Check, Clock, ChevronDown } from "lucide-react";
import { mockListings, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

export default function Marketplace() {
  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-full w-full">
        {/* Left Sidebar - Filters */}
        <div className="w-full md:w-[280px] flex-shrink-0 bg-card border-r border-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm tracking-widest text-muted-foreground">REFINE SEARCH</h3>
            <button className="text-xs text-primary font-medium hover:underline">Clear All</button>
          </div>

          <div className="space-y-8">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Price Range (Million ₦)</h4>
              <div className="flex items-center gap-2 mb-4">
                <Input type="number" placeholder="Min" defaultValue={1} className="h-9 text-sm" />
                <span className="text-muted-foreground">-</span>
                <Input type="number" placeholder="Max" defaultValue={1200} className="h-9 text-sm" />
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 ml-[10%] rounded-full"></div>
              </div>
            </div>

            {/* Land Usage */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Land Usage Type</h4>
              <div className="space-y-2.5">
                {['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Institutional'].map((type, i) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${i < 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {i < 2 && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authority */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Certifying Authority</h4>
              <div className="space-y-2.5">
                {['Lagos State Land Bureau', 'Ogun Land Registry', 'Federal Land Commission', 'FCT Administration'].map((type, i) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${i === 0 ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {i === 0 && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                Additional Features
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-[#E6F4EA] border border-[#A8DAB5] rounded-lg p-4 mt-8">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h5 className="font-bold text-primary text-sm">INSTITUTIONAL GUARANTEE</h5>
              </div>
              <p className="text-xs text-primary/80 leading-relaxed font-medium mb-3">
                All listings on this platform have undergone a multi-stage verification process by the relevant State and Federal Land Commissions.
              </p>
              <a href="#" className="text-xs font-bold text-primary hover:underline">Learn about verification →</a>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-y-auto">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Verified Land Marketplace</h1>
              <p className="text-muted-foreground text-sm">Secure your future with government-verified property assets.</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-card border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex bg-muted p-1 rounded-md">
                  <button className="px-3 py-1.5 bg-background shadow-sm rounded text-xs font-semibold flex items-center gap-2">
                    <List className="w-4 h-4" /> List
                  </button>
                  <button className="px-3 py-1.5 text-muted-foreground rounded text-xs font-semibold flex items-center gap-2 hover:text-foreground">
                    <Map className="w-4 h-4" /> Map
                  </button>
                </div>
                <div className="h-6 w-px bg-border mx-1"></div>
                <Button variant="outline" size="sm" className="text-xs h-9 font-semibold">
                  Sort: Newest First <ChevronDown className="w-3 h-3 ml-2"/>
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 font-semibold hidden sm:flex">
                  Lagos State <ChevronDown className="w-3 h-3 ml-2"/>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer hidden md:flex">
                  <div className="relative w-8 h-4 bg-primary rounded-full transition-colors">
                    <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full transition-transform"></div>
                  </div>
                  <span className="text-xs font-semibold">Verified Only</span>
                </label>
                <Button size="sm" className="h-9 px-6 font-semibold">Search</Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white border rounded text-xs px-3 py-1 font-medium hover:bg-muted/50 cursor-pointer">
                  Verified Listings <span className="ml-2 text-muted-foreground">×</span>
                </Badge>
                <Badge variant="secondary" className="bg-white border rounded text-xs px-3 py-1 font-medium hover:bg-muted/50 cursor-pointer">
                  Lagos State <span className="ml-2 text-muted-foreground">×</span>
                </Badge>
                <span className="text-xs text-primary font-semibold cursor-pointer hover:underline ml-2">Clear all</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Showing 126 properties</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {mockListings.map((listing, i) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full border-border/60">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-slate-800/80 group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        {listing.status === "Verified" ? (
                          <Badge variant="success" className="bg-green-500 text-white border-none shadow-sm backdrop-blur-md bg-opacity-90 font-bold tracking-wide text-[10px] px-2 py-1 uppercase">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="bg-amber-500 text-white border-none shadow-sm backdrop-blur-md bg-opacity-90 font-bold tracking-wide text-[10px] px-2 py-1 uppercase">
                            Pending
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-black/40 text-white border-none backdrop-blur-md text-xs font-semibold">
                          {listing.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">{listing.type}</p>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{listing.name}</h3>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location}</span>
                    </div>

                    <div className="mt-auto border-t border-border/50 pt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">{listing.size}</p>
                        <p className="font-bold text-xl text-foreground">{formatCurrency(listing.value)}</p>
                      </div>
                      <Link href={`/marketplace/${listing.id}`}>
                        <Button className="w-10 h-10 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                          <ChevronDown className="w-5 h-5 -rotate-90" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mb-16">
              <Button variant="outline" size="sm" className="h-9 font-semibold" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold bg-primary text-primary-foreground border-primary">1</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-semibold">2</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-semibold">3</Button>
              <span className="text-muted-foreground px-2">...</span>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-semibold">12</Button>
              <Button variant="outline" size="sm" className="h-9 font-semibold">Next Page</Button>
            </div>

            {/* Recently Verified */}
            <div className="border-t border-border pt-12 pb-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                Recently Verified Near You <Clock className="w-5 h-5 text-muted-foreground"/>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockListings.slice(2, 5).map(listing => (
                  <div key={`recent-${listing.id}`} className="flex gap-4 bg-card p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                       <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                       <Badge className="absolute top-1 left-1 scale-75 origin-top-left bg-green-500 px-1 py-0 border-none rounded-sm">NEW</Badge>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm line-clamp-1">{listing.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{listing.location}</p>
                      <p className="font-semibold text-sm text-primary">{formatCurrency(listing.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
