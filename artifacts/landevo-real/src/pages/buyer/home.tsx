import React from "react";
import { motion } from "framer-motion";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Handshake, ShieldCheck, TrendingUp, MapPin, TrendingDown } from "lucide-react";
import { mockBuyerOffers, mockListings, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

const STAT_CARDS = [
  {
    label: "PROPERTIES SAVED",
    value: "12",
    delta: "+3",
    up: true,
    icon: Heart,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "ACTIVE OFFERS",
    value: "3",
    delta: "+1",
    up: true,
    icon: Handshake,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "IN ESCROW",
    value: "2",
    delta: "–",
    up: null,
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-100",
    accent: true,
  },
  {
    label: "TOTAL INVESTED",
    value: "₦125M",
    delta: "+₦25M",
    up: true,
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function BuyerHome() {
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
          {STAT_CARDS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className={`hover:shadow-md transition-shadow ${s.accent ? "border-amber-200" : ""}`}>
                  <CardContent className={`p-5 ${s.accent ? "bg-amber-50/30" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                    </div>
                    <h3 className={`text-2xl font-bold ${s.accent ? "text-amber-700" : ""}`}>{s.value}</h3>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider mt-1">{s.label}</p>
                    {s.delta !== "–" && (
                      <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${s.up ? "text-green-600" : "text-destructive"}`}>
                        {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {s.delta} <span className="text-muted-foreground font-normal">this month</span>
                      </p>
                    )}
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
                {mockBuyerOffers.map((offer) => (
                  <TableRow key={offer.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground line-clamp-1">{offer.propertyName}</span>
                        <span className="text-[10px] text-muted-foreground">{offer.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{formatCurrency(offer.amount)}</TableCell>
                    <TableCell>
                      {offer.status === "ACCEPTED" && <Badge className="bg-green-100 text-green-700 border-none text-[10px] px-2 py-0 hover:bg-green-100">Accepted</Badge>}
                      {offer.status === "UNDER REVIEW" && <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] px-2 py-0 hover:bg-amber-100">Under Review</Badge>}
                      {offer.status === "PENDING" && <Badge className="bg-gray-100 text-gray-700 border-none text-[10px] px-2 py-0 hover:bg-gray-100">Pending</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground hidden sm:table-cell">{offer.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recently Viewed Properties */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-base">Recently Viewed</h3>
            <Link href="/buyer/browse" className="text-xs font-semibold text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockListings.slice(0, 4).map((listing, i) => (
              <Link key={listing.id} href={`/buyer/property/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all group h-full border-border/60 cursor-pointer">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-slate-700 to-teal-900' : 'from-green-900 to-slate-800'} group-hover:scale-105 transition-transform duration-500`} />
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-0.5 hover:bg-green-500">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors mb-1">{listing.name}</h4>
                    <div className="flex items-center text-[10px] text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold text-sm">{formatCurrency(listing.value)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{listing.size}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </BuyerLayout>
  );
}
