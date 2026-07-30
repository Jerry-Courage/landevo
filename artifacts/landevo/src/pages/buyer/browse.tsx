import React, { useState, useDeferredValue } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Map, List, MapPin, ShieldCheck, Check, ChevronDown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useListListings } from "@workspace/api-client-react";
import type { Listing } from "@workspace/api-client-react";

const PROPERTY_TYPES = ["residential", "commercial", "land", "apartment"] as const;
const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  land: "Land",
  apartment: "Apartment",
};

const GRADIENTS = [
  "from-teal-900 to-slate-800",
  "from-slate-800 to-green-900",
  "from-slate-700 to-emerald-900",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })
    .format(n)
    .replace("NGN", "₦");
}

export default function BuyerBrowse() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const deferredSearch = useDeferredValue(search);

  const { data: listings = [], isLoading } = useListListings({
    query: {
      queryKey: ["/api/listings", deferredSearch, selectedTypes.join(","), minPrice, maxPrice],
    },
  });

  // Client-side filter for type and price (API already filters by search/status)
  const filtered = listings.filter((l: Listing) => {
    if (selectedTypes.length > 0 && !selectedTypes.includes(l.propertyType)) return false;
    if (minPrice && l.price < parseFloat(minPrice)) return false;
    if (maxPrice && l.price > parseFloat(maxPrice)) return false;
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      if (
        !l.title.toLowerCase().includes(q) &&
        !l.city.toLowerCase().includes(q) &&
        !l.location.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  function toggleType(t: string) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearFilters() {
    setSelectedTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  }

  return (
    <BuyerLayout>
      <div className="flex flex-col md:flex-row h-full w-full">
        {/* Left Sidebar – Filters */}
        <div className="w-full md:w-[240px] flex-shrink-0 bg-card border-r border-border p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-foreground">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-medium hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Price (₦)
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Property Type
              </h4>
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => {
                  const checked = selectedTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleType(type)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          checked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-input bg-background group-hover:border-primary/50"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {TYPE_LABELS[type]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
            {/* Page Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Browse Properties
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {sorted.length} verified propert{sorted.length === 1 ? "y" : "ies"}
                    </span>
                  </>
                )}
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
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="h-8 pl-3 pr-7 text-xs font-semibold rounded-md border bg-background appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
              <div className="relative w-full sm:w-52">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full rounded-md border pl-3 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedTypes.length > 0 || minPrice || maxPrice) && (
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground">
                  Active filters:
                </span>
                {selectedTypes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20"
                  >
                    {TYPE_LABELS[t]}
                    <button onClick={() => toggleType(t)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                    ₦{minPrice || "0"} – ₦{maxPrice || "∞"}
                    <button
                      onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading listings…
              </div>
            )}

            {/* Empty state */}
            {!isLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-semibold text-foreground">No properties found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search terms.
                </p>
                <Button variant="outline" size="sm" className="mt-4 font-semibold" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}

            {/* Property Grid */}
            {!isLoading && sorted.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {sorted.map((listing: Listing, i: number) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full border-border/60"
                  >
                    <Link href={`/buyer/property/${listing.id}`}>
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden cursor-pointer">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${
                              GRADIENTS[i % GRADIENTS.length]
                            } group-hover:scale-105 transition-transform duration-500`}
                          />
                        )}
                        <div className="absolute top-3 left-3">
                          {listing.status === "active" || listing.status === "verified" ? (
                            <Badge className="bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-1 hover:bg-green-500">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-1 hover:bg-amber-500">
                              {listing.status === "under_offer" ? "Under Offer" : "Pending"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">
                        {TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                      </p>
                      <Link href={`/buyer/property/${listing.id}`}>
                        <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer mb-2">
                          {listing.title}
                        </h3>
                      </Link>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {listing.city}, {listing.state} · {listing.areaSqm} sqm
                        </span>
                      </div>
                      <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
                        <p className="font-bold text-lg">{formatCurrency(listing.price)}</p>
                        <Link href={`/buyer/property/${listing.id}`}>
                          <Button
                            size="sm"
                            className="text-xs font-bold h-8 px-3 bg-primary hover:bg-primary/90"
                          >
                            View & Offer
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
