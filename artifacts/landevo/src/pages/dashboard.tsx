import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Filter, MoreHorizontal, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetAgentDashboard, useListListings } from "@workspace/api-client-react";

const chartData = [
  { name: 'Jan', newListings: 12, completedSales: 4 },
  { name: 'Feb', newListings: 18, completedSales: 8 },
  { name: 'Mar', newListings: 15, completedSales: 12 },
  { name: 'Apr', newListings: 22, completedSales: 15 },
  { name: 'May', newListings: 28, completedSales: 18 },
  { name: 'Jun', newListings: 32, completedSales: 24 },
];

function statusBadge(status: string) {
  if (status === "verified" || status === "active") {
    return (
      <div className="flex items-center text-green-600 bg-green-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Institutional Verified
      </div>
    );
  }
  if (status === "pending_verification" || status === "under_offer") {
    return (
      <div className="flex items-center text-amber-600 bg-amber-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Audit
      </div>
    );
  }
  return (
    <div className="flex items-center text-red-600 bg-red-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Correction Required
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboard } = useGetAgentDashboard();
  const { data: listings } = useListListings();

  const activeListings = dashboard?.activeListings ?? 0;
  const totalListings = dashboard?.totalListings ?? 0;
  const pendingVerifications = dashboard?.pendingVerifications ?? 0;
  const totalOfferValue = dashboard?.totalOfferValue ?? 0;
  const verifiedCount = (dashboard?.listingsByStatus as Record<string, number> | undefined)?.['verified'] ?? 0;
  const verifiedPct = totalListings > 0 ? Math.round((verifiedCount / totalListings) * 100) : 0;

  const displayListings = listings?.slice(0, 5) ?? [];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitor your property portfolio and sales performance.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/listings/create">
              <Button>+ New Listing</Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">TOTAL OFFER VALUE</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{formatCurrency(totalOfferValue)}</h3>
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Live
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">ACTIVE LISTINGS</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{activeListings}</h3>
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Live
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">VERIFIED STATUS</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{verifiedPct}%</h3>
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Live
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">PENDING REVIEWS</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{String(pendingVerifications).padStart(2, '0')}</h3>
                <div className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${pendingVerifications > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                  {pendingVerifications > 0 ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {pendingVerifications > 0 ? 'Needs action' : 'Clear'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Chart & Verifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Listing activity and successful closing trends (H1 2023)</CardDescription>
              </div>
              <Badge variant="outline" className="bg-muted">Listing Cycle: 45 Days</Badge>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 45% 22%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(145 45% 22%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 30% 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(145 30% 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="newListings" name="New Listings" stroke="hsl(145 45% 22%)" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                  <Area type="monotone" dataKey="completedSales" name="Completed Sales" stroke="hsl(145 30% 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Document Status</CardTitle>
              <CardDescription>Recent document activity</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h4 className="font-semibold text-sm">Land Title</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">David Kalu • Oct 12, 2023</p>
                  </div>
                  <Badge variant="info">IN PROGRESS</Badge>
                </div>
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h4 className="font-semibold text-sm">Survey Plan</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Sarah Chen • Oct 14, 2023</p>
                  </div>
                  <Badge variant="success">COMPLETED</Badge>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">C of O</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Musa Ibrahim • Oct 15, 2023</p>
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-muted-foreground tracking-wider">AGENT TRUST SCORE</span>
                  <span className="text-lg font-bold text-primary">98.5</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "98.5%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-primary h-full rounded-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Active Asset Inventory</CardTitle>
              <CardDescription>All active properties in your portfolio.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8"><Filter className="w-3 h-3 mr-2"/> Filter</Button>
              <Button variant="outline" size="sm" className="h-8">Bulk Action</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">REF ID</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">PROPERTY ASSET</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">DIMENSION</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground text-right">VALUE (₦)</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">TRUST BADGE</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                      No listings yet. <Link href="/listings/create"><span className="text-primary underline cursor-pointer">Create your first listing</span></Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayListings.map((listing) => (
                    <TableRow key={listing.id} className="group hover:bg-muted/30 cursor-pointer transition-colors">
                      <TableCell className="font-medium text-xs">#{listing.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{listing.title}</span>
                          <span className="text-xs text-muted-foreground">{listing.city}, {listing.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{listing.areaSqm} sqm</TableCell>
                      <TableCell className="text-sm font-semibold text-right">{formatCurrency(listing.price)}</TableCell>
                      <TableCell>{statusBadge(listing.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-xs text-muted-foreground">Showing {displayListings.length} of {totalListings} properties in portfolio</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
