import React from "react";
import { motion } from "framer-motion";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Handshake, ShieldCheck, TrendingUp, MapPin, ArrowRight, TrendingDown } from "lucide-react";
import { mockBuyerOffers, mockBuyerEscrows, mockListings, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const activityData = [
  { month: "Feb", offers: 1, viewed: 4 },
  { month: "Mar", offers: 2, viewed: 7 },
  { month: "Apr", offers: 1, viewed: 5 },
  { month: "May", offers: 3, viewed: 11 },
  { month: "Jun", offers: 2, viewed: 9 },
  { month: "Jul", offers: 3, viewed: 14 },
];

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
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Babatunde</h1>
            <p className="text-muted-foreground mt-1 text-sm">You are logged in as a verified buyer. Track your offers and escrows.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-xs font-semibold text-primary hover:underline self-end pb-1 md:hidden">
              Switch to Agent View →
            </Link>
            <Link href="/buyer/browse" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Browse Properties
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Card className={`hover:shadow-md transition-shadow ${s.accent ? "border-amber-200" : ""}`}>
                  <CardContent className={`p-6 ${s.accent ? "bg-amber-50/30" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground tracking-wider">{s.label}</p>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                    </div>
                    <h3 className={`text-2xl font-bold ${s.accent ? "text-amber-700" : ""}`}>{s.value}</h3>
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

        {/* Chart + Escrow row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Offer Activity Chart */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Offer & Viewing Activity</CardTitle>
              <CardDescription>Properties viewed and offers submitted over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOffersB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145,45%,22%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(145,45%,22%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViewedB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145,60%,35%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(145,60%,35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(214,32%,91%)" }} />
                  <Area type="monotone" dataKey="viewed" name="Properties Viewed" stroke="hsl(145,60%,35%)" strokeWidth={2} fill="url(#colorViewedB)" dot={false} />
                  <Area type="monotone" dataKey="offers" name="Offers Submitted" stroke="hsl(145,45%,22%)" strokeWidth={2} fill="url(#colorOffersB)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Escrow Status</CardTitle>
                <CardDescription>Active escrow progress.</CardDescription>
              </div>
              <Link href="/buyer/escrow" className="text-xs font-semibold text-primary hover:underline">
                Details
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {mockBuyerEscrows.map((escrow, i) => (
                <div key={escrow.id} className="border rounded-lg p-4 flex flex-col hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{escrow.propertyName}</h4>
                      <p className="text-xs font-semibold text-primary mt-0.5">{formatCurrency(escrow.amount)}</p>
                    </div>
                    {i === 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Awaiting</Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-medium mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{escrow.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${i === 0 ? 'bg-green-600' : 'bg-amber-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${escrow.progress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.15 }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-3 border-t">
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 flex-1 pr-2">{escrow.status}</p>
                    <Link href="/buyer/escrow" className="text-[10px] font-bold text-primary flex items-center gap-1 shrink-0">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">OFFER AMOUNT</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">STATUS</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground text-right">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBuyerOffers.map((offer) => (
                  <TableRow key={offer.id} className="group hover:bg-muted/30 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">{offer.propertyName}</span>
                        <span className="text-[10px] text-muted-foreground">{offer.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{formatCurrency(offer.amount)}</TableCell>
                    <TableCell>
                      {offer.status === "ACCEPTED" && <Badge className="bg-green-100 text-green-700 border-none text-[10px] px-2 py-0 hover:bg-green-100">ACCEPTED</Badge>}
                      {offer.status === "UNDER REVIEW" && <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] px-2 py-0 hover:bg-amber-100">UNDER REVIEW</Badge>}
                      {offer.status === "PENDING" && <Badge className="bg-gray-100 text-gray-700 border-none text-[10px] px-2 py-0 hover:bg-gray-100">PENDING</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">{offer.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg">Recently Viewed Properties</h3>
            <Link href="/buyer/browse" className="text-xs font-semibold text-primary hover:underline">
              Browse all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockListings.slice(0, 4).map((listing, i) => (
              <Link key={`recent-${listing.id}`} href={`/buyer/property/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all group h-full border-border/60 cursor-pointer">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-slate-700 to-teal-900' : 'from-green-900 to-slate-800'} group-hover:scale-105 transition-transform duration-500`}></div>
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-0.5 hover:bg-green-500">
                      <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors mb-1">{listing.name}</h4>
                    <div className="flex items-center text-[10px] text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold text-sm text-foreground">{formatCurrency(listing.value)}</p>
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
