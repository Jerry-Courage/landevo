import React from "react";
import { motion } from "framer-motion";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Handshake, ShieldCheck, TrendingUp, MapPin, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";
import { useGetBuyerDashboard } from "@workspace/api-client-react";

function offerStatusLabel(status: string) {
  switch (status) {
    case "accepted": return <Badge className="bg-green-100 text-green-700 border-none text-[10px] px-2 py-0 hover:bg-green-100">Accepted</Badge>;
    case "pending":  return <Badge className="bg-gray-100 text-gray-700 border-none text-[10px] px-2 py-0 hover:bg-gray-100">Pending</Badge>;
    case "rejected": return <Badge className="bg-red-100 text-red-700 border-none text-[10px] px-2 py-0 hover:bg-red-100">Rejected</Badge>;
    case "withdrawn":return <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] px-2 py-0 hover:bg-slate-100">Withdrawn</Badge>;
    default:         return <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] px-2 py-0 hover:bg-amber-100">Under Review</Badge>;
  }
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function BuyerHome() {
  const { data: dashboard } = useGetBuyerDashboard();

  const activeOffers       = dashboard?.activeOffers ?? 0;
  const acceptedOffers     = dashboard?.acceptedOffers ?? 0;
  const activeTransactions = dashboard?.activeTransactions ?? 0;
  const recentOffers       = dashboard?.recentOffers ?? [];
  const recentListings     = dashboard?.recentListings ?? [];

  const statCards = [
    { label: "ACTIVE OFFERS",      value: String(activeOffers),      icon: Handshake,   color: "text-primary",    bg: "bg-primary/10"  },
    { label: "ACCEPTED OFFERS",    value: String(acceptedOffers),    icon: ShieldCheck, color: "text-emerald-600",bg: "bg-emerald-100" },
    { label: "IN ESCROW",          value: String(activeTransactions), icon: TrendingUp,  color: "text-amber-600",  bg: "bg-amber-100", accent: true },
    { label: "AVAILABLE LISTINGS", value: String(recentListings.length), icon: Building2,  color: "text-primary",  bg: "bg-primary/10"  },
  ];

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track your offers, escrows, and saved properties.</p>
          </div>
          <Link
            href="/buyer/browse"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 self-start sm:self-end"
          >
            Browse Properties
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className={`hover:shadow-md transition-shadow ${"accent" in s && s.accent ? "border-amber-200" : ""}`}>
                  <CardContent className={`p-5 ${"accent" in s && s.accent ? "bg-amber-50/30" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                    </div>
                    <h3 className={`text-2xl font-bold ${"accent" in s && s.accent ? "text-amber-700" : ""}`}>{s.value}</h3>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Active Offers Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>My Active Offers</CardTitle>
              <CardDescription>Recent offer submissions and current status.</CardDescription>
            </div>
            <Link href="/buyer/offers" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">PROPERTY</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">OFFER</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">STATUS</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground text-right hidden sm:table-cell">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">
                      No offers yet — <Link href="/buyer/browse" className="text-primary underline">browse properties</Link> to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOffers.map((offer) => (
                    <TableRow key={offer.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground line-clamp-1">{offer.listingTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-bold">{formatCurrency(offer.amount)}</TableCell>
                      <TableCell>{offerStatusLabel(offer.status)}</TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground hidden sm:table-cell">{fmt(offer.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recently Available Properties */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-base">Recent Listings</h3>
            <Link href="/buyer/browse" className="text-xs font-semibold text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          {recentListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentListings.slice(0, 4).map((listing, i) => (
                <Link key={listing.id} href={`/buyer/property/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all group h-full border-border/60 cursor-pointer">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-slate-700 to-teal-900' : 'from-green-900 to-slate-800'} group-hover:scale-105 transition-transform duration-500`} />
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-0.5 hover:bg-green-500">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors mb-1">{listing.title}</h4>
                      <div className="flex items-center text-[10px] text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.location ?? listing.city ?? listing.state ?? ""}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="font-bold text-sm">{formatCurrency(listing.price)}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{listing.areaSqm ? `${listing.areaSqm} sqm` : listing.propertyType}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </BuyerLayout>
  );
}
