import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Map, List, MapPin, ShieldCheck, Check, ChevronDown, Heart } from "lucide-react";
import { mockListings, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

export default function BuyerBrowse() {
  return (
    <BuyerLayout>
      <div className="flex flex-col md:flex-row h-full w-full">

        {/* Left Sidebar – Filters */}
        <div className="w-full md:w-[240px] flex-shrink-0 bg-card border-r border-border p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-foreground">Filters</h3>
            <button className="text-xs text-primary font-medium hover:underline">Clear</button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Price (Million ₦)</h4>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" defaultValue={1} className="h-8 text-sm" />
                <span className="text-muted-foreground text-sm">–</span>
                <Input type="number" placeholder="Max" defaultValue={1200} className="h-8 text-sm" />
              </div>
            </div>

            {/* Land Usage */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Land Usage</h4>
              <div className="space-y-2">
                {['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Institutional'].map((type, i) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${i < 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {i < 2 && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authority */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Certifying Authority</h4>
              <div className="space-y-2">
                {['Lagos State Land Bureau', 'Ogun Land Registry', 'Federal Land Commission', 'FCT Administration'].map((type, i) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${i === 0 ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {i === 0 && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">

            {/* Page Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Browse Properties</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Showing <span className="font-semibold text-foreground">126 verified properties</span>
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex bg-muted p-1 rounded-md">
                  <button className="px-3 py-1.5 bg-background shadow-sm rounded text-xs font-semibold flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button className="px-3 py-1.5 text-muted-foreground rounded text-xs font-semibold flex items-center gap-1.5 hover:text-foreground">
                    <Map className="w-3.5 h-3.5" /> Map
                  </button>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-8 font-semibold">
                  Newest First <ChevronDown className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
              <div className="relative w-full sm:w-52">
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="h-8 w-full rounded-md border pl-3 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Active filter chips */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">Active filters:</span>
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                Lagos State <button className="ml-1 hover:text-destructive">×</button>
              </span>
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                Residential <button className="ml-1 hover:text-destructive">×</button>
              </span>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {mockListings.map((listing, i) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full border-border/60">
                  <Link href={`/buyer/property/${listing.id}`}>
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden cursor-pointer">
                      <div className={`absolute inset-0 bg-gradient-to-br ${i % 3 === 0 ? 'from-teal-900 to-slate-800' : i % 3 === 1 ? 'from-slate-800 to-green-900' : 'from-slate-700 to-emerald-900'} group-hover:scale-105 transition-transform duration-500`} />
                      <div className="absolute top-3 left-3">
                        {listing.status === "Verified" ? (
                          <Badge className="bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-1 hover:bg-green-500">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-1 hover:bg-amber-500">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">{listing.type}</p>
                    <Link href={`/buyer/property/${listing.id}`}>
                      <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer mb-2">{listing.name}</h3>
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location} · {listing.size}</span>
                    </div>
                    <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
                      <p className="font-bold text-lg">{formatCurrency(listing.value)}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs font-bold h-8 px-3 gap-1.5">
                          <Heart className="w-3.5 h-3.5" /> Save
                        </Button>
                        <Link href={`/buyer/property/${listing.id}`}>
                          <Button size="sm" className="text-xs font-bold h-8 px-3 bg-primary hover:bg-primary/90">
                            Offer
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pb-8">
              <Button variant="outline" size="sm" className="h-9 font-semibold" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-bold bg-primary text-primary-foreground border-primary">1</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-semibold">2</Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 font-semibold">3</Button>
              <span className="text-muted-foreground px-1">...</span>
              <Button variant="outline" size="sm" className="h-9 font-semibold">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
