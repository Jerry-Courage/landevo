import React, { useState, useCallback } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Map, List, MapPin, ShieldCheck, Clock, ChevronDown, Loader2, Check, X,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Link } from "wouter";
import { useListListings } from "@workspace/api-client-react";
import type { ListingStatus } from "@workspace/api-client-react";

// ── types ──────────────────────────────────────────────────────────────────
type PropertyType = "land" | "residential" | "commercial" | "apartment";
type SortKey = "newest" | "price_asc" | "price_desc" | "area_asc";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "land",        label: "Land / Plot" },
  { value: "residential", label: "Residential" },
  { value: "commercial",  label: "Commercial" },
  { value: "apartment",   label: "Apartment" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "area_asc",   label: "Largest Area" },
];

// ── helpers ────────────────────────────────────────────────────────────────
function listingStatusBadge(status: ListingStatus) {
  if (status === "verified" || status === "active") {
    return (
      <Badge className="bg-green-500 text-white border-none shadow-sm font-bold tracking-wide text-[10px] px-2 py-1 uppercase">
        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
      </Badge>
    );
  }
  if (status === "pending_verification") {
    return (
      <Badge className="bg-amber-500 text-white border-none shadow-sm font-bold tracking-wide text-[10px] px-2 py-1 uppercase">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-slate-500 text-white border-none shadow-sm font-bold tracking-wide text-[10px] px-2 py-1 uppercase">
      {status}
    </Badge>
  );
}

function sortListings(listings: ReturnType<typeof useListListings>["data"], key: SortKey) {
  if (!listings) return [];
  return [...listings].sort((a, b) => {
    if (key === "price_asc")  return a.price - b.price;
    if (key === "price_desc") return b.price - a.price;
    if (key === "area_asc")   return (b.areaSqm ?? 0) - (a.areaSqm ?? 0);
    // newest: descending createdAt
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// ── component ──────────────────────────────────────────────────────────────
export default function Marketplace() {
  // filter state
  const [search,       setSearch]       = useState("");
  const [minPrice,     setMinPrice]     = useState("");   // in millions ₵
  const [maxPrice,     setMaxPrice]     = useState("");   // in millions ₵
  const [selectedTypes, setSelectedTypes] = useState<Set<PropertyType>>(new Set());
  const [sort,         setSort]         = useState<SortKey>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // build API params — price is stored in millions, API expects raw ₵
  const minPriceRaw = minPrice ? parseFloat(minPrice) * 1_000_000 : undefined;
  const maxPriceRaw = maxPrice ? parseFloat(maxPrice) * 1_000_000 : undefined;

  // If exactly one type is selected we can push it to the API; otherwise fetch
  // all and filter the multi-selection client-side (API accepts a single value).
  const apiPropertyType =
    selectedTypes.size === 1 ? [...selectedTypes][0] : undefined;

  const { data: raw = [], isLoading } = useListListings({
    search:       search || undefined,
    minPrice:     minPriceRaw,
    maxPrice:     maxPriceRaw,
    propertyType: apiPropertyType,
  });

  // Client-side pass for multi-type selections (single-type already filtered by API)
  const afterTypeFilter =
    selectedTypes.size <= 1
      ? raw
      : raw.filter((l) => selectedTypes.has(l.propertyType as PropertyType));

  const listings = sortListings(afterTypeFilter, sort);

  const recentVerified = raw
    .filter((l) => l.status === "verified" || l.status === "active")
    .slice(0, 3);

  // active filter count (for badge on "Clear All")
  const activeFilterCount =
    (search ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    selectedTypes.size;

  const clearAll = useCallback(() => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedTypes(new Set());
  }, []);

  function toggleType(t: PropertyType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-full w-full">

        {/* ── Left Sidebar ──────────────────────────────────────────────── */}
        <div className="w-full md:w-[280px] flex-shrink-0 bg-card border-r border-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm tracking-widest text-muted-foreground">REFINE SEARCH</h3>
            {activeFilterCount > 0 && (
              <button
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                onClick={clearAll}
              >
                <X className="w-3 h-3" /> Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Price Range (Million ₵)</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  min={0}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 text-sm"
                />
                <span className="text-muted-foreground flex-shrink-0">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  min={0}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              {(minPrice || maxPrice) && (
                <p className="text-xs text-muted-foreground mt-2">
                  {minPrice ? `₵${parseFloat(minPrice).toLocaleString()}M` : "Any"} –{" "}
                  {maxPrice ? `₵${parseFloat(maxPrice).toLocaleString()}M` : "Any"}
                </p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Property Type</h4>
              <div className="space-y-2.5">
                {PROPERTY_TYPES.map(({ value, label }) => {
                  const checked = selectedTypes.has(value);
                  return (
                    <label
                      key={value}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleType(value)}
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
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#E6F4EA] border border-[#A8DAB5] rounded-lg p-4 mt-8">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h5 className="font-bold text-primary text-sm">INSTITUTIONAL GUARANTEE</h5>
              </div>
              <p className="text-xs text-primary/80 leading-relaxed font-medium mb-3">
                All listings on this platform have undergone a multi-stage verification process by the
                relevant State and Federal Land Commissions.
              </p>
              <a href="#" className="text-xs font-bold text-primary hover:underline">
                Learn about verification →
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-y-auto">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">

            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                Verified Land Marketplace
              </h1>
              <p className="text-muted-foreground text-sm">
                Secure your future with government-verified property assets.
              </p>
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

                <div className="h-6 w-px bg-border mx-1" />

                {/* Sort dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 font-semibold"
                    onClick={() => setShowSortMenu((v) => !v)}
                  >
                    {currentSortLabel} <ChevronDown className="w-3 h-3 ml-2" />
                  </Button>
                  {showSortMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[180px] py-1">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                            sort === o.value ? "font-semibold text-primary" : ""
                          }`}
                          onClick={() => { setSort(o.value); setShowSortMenu(false); }}
                        >
                          {o.value === sort && <Check className="w-3 h-3 inline mr-2" />}
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 max-w-xs ml-auto">
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Search: "{search}"
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Price: {minPrice ? `₵${minPrice}M` : "any"} – {maxPrice ? `₵${maxPrice}M` : "any"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {[...selectedTypes].map((t) => (
                  <Badge key={t} variant="secondary" className="flex items-center gap-1 pr-1 capitalize">
                    {PROPERTY_TYPES.find((p) => p.value === t)?.label ?? t}
                    <button onClick={() => toggleType(t)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white border rounded text-xs px-3 py-1 font-medium">
                  Verified Listings
                </Badge>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {isLoading ? "Loading…" : `Showing ${listings.length} ${listings.length === 1 ? "property" : "properties"}`}
              </span>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24 bg-card border rounded-lg">
                <p className="text-muted-foreground font-medium">No properties match your filters.</p>
                {activeFilterCount > 0 && (
                  <button className="text-sm text-primary mt-2 hover:underline" onClick={clearAll}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {listings.map((listing, i) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full border-border/60"
                  >
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${
                            i % 3 === 0
                              ? "from-green-900/40 to-slate-800/80"
                              : i % 3 === 1
                              ? "from-slate-700/60 to-teal-900/80"
                              : "from-emerald-900/40 to-slate-700/80"
                          } group-hover:scale-105 transition-transform duration-500`}
                        />
                      )}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          {listingStatusBadge(listing.status)}
                          <Badge className="bg-black/40 text-white border-none backdrop-blur-md text-xs font-semibold">
                            #{listing.id}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">
                          {listing.propertyType}
                        </p>
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {listing.location || `${listing.city}, ${listing.state}`}
                        </span>
                      </div>

                      <div className="mt-auto border-t border-border/50 pt-4 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">
                            {listing.areaSqm
                              ? `${listing.areaSqm.toLocaleString()} sqm`
                              : listing.propertyType}
                          </p>
                          <p className="font-bold text-xl text-foreground">
                            {formatCurrency(listing.price)}
                          </p>
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
            )}

            {/* Recently Verified */}
            {recentVerified.length > 0 && (
              <div className="border-t border-border pt-12 pb-8">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  Recently Verified <Clock className="w-5 h-5 text-muted-foreground" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentVerified.map((listing) => (
                    <Link key={`recent-${listing.id}`} href={`/marketplace/${listing.id}`}>
                      <div className="flex gap-4 bg-card p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                          {listing.images?.[0] ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                          )}
                          <Badge className="absolute top-1 left-1 scale-75 origin-top-left bg-green-500 px-1 py-0 border-none rounded-sm">
                            NEW
                          </Badge>
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-sm line-clamp-1">{listing.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            {listing.location || listing.city}
                          </p>
                          <p className="font-semibold text-sm text-primary">
                            {formatCurrency(listing.price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
