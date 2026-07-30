import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Handshake, ShieldCheck, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { mockBuyerOffers, mockBuyerEscrows, mockListings, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

export default function BuyerHome() {
  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Babatunde</h1>
            <p className="text-muted-foreground mt-1 text-sm">You are logged in as a verified buyer. Track your offers and escrows.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-xs font-semibold text-primary hover:underline self-end pb-1 md:hidden">
              Switch to Agent View →
            </Link>
            <Link href="/buyer/browse" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Browse Properties
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">PROPERTIES SAVED</p>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">12</h3>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">ACTIVE OFFERS</p>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">3</h3>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-amber-200">
            <CardContent className="p-6 bg-amber-50/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">IN ESCROW</p>
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-700">2</h3>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">TOTAL INVESTED</p>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">₦ 125M</h3>
            </CardContent>
          </Card>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Active Offers */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>My Active Offers</CardTitle>
                <CardDescription>Recent offer submissions and status.</CardDescription>
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
                        {offer.status === "ACCEPTED" && <Badge variant="success" className="bg-green-100 text-green-700 border-none text-[10px] px-2 py-0">ACCEPTED</Badge>}
                        {offer.status === "UNDER REVIEW" && <Badge variant="warning" className="bg-amber-100 text-amber-700 border-none text-[10px] px-2 py-0">UNDER REVIEW</Badge>}
                        {offer.status === "PENDING" && <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-none text-[10px] px-2 py-0">PENDING</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">{offer.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right: Escrow Status */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Escrow Status</CardTitle>
                <CardDescription>Track funds and verification progress.</CardDescription>
              </div>
              <Link href="/buyer/escrow" className="text-xs font-semibold text-primary hover:underline">
                View detailed tracker
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
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-medium mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{escrow.progress}% Complete</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i === 0 ? 'bg-green-600' : 'bg-amber-500'}`} style={{ width: `${escrow.progress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-3 border-t">
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 flex-1 pr-2">{escrow.status}</p>
                    <Link href="/buyer/escrow" className="text-[10px] font-bold text-primary flex items-center gap-1 shrink-0">
                      View Escrow <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Recently Viewed */}
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
                    <div className={`absolute inset-0 bg-gradient-to-br ${i%2===0 ? 'from-slate-700 to-teal-900' : 'from-green-900 to-slate-800'} group-hover:scale-105 transition-transform duration-500`}></div>
                    <Badge variant="success" className="absolute top-3 left-3 bg-green-500 text-white border-none shadow-sm font-bold text-[10px] px-2 py-0.5">
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
