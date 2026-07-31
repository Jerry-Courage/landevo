import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpRight, ArrowDownRight, Filter, MoreHorizontal, ShieldCheck, Clock,
  AlertTriangle, Check, X, Trash2, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAgentDashboard, useListListings, useAcceptOffer, useRejectOffer,
  useDeleteListing, getGetAgentDashboardQueryKey, getListListingsQueryKey,
} from "@workspace/api-client-react";

function statusBadge(status: string) {
  if (status === "verified" || status === "active") {
    return (
      <div className="flex items-center text-green-600 bg-green-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Verified
      </div>
    );
  }
  if (status === "pending_verification") {
    return (
      <div className="flex items-center text-amber-600 bg-amber-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Verification
      </div>
    );
  }
  if (status === "under_offer") {
    return (
      <div className="flex items-center text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 mr-1.5" /> Under Offer
      </div>
    );
  }
  return (
    <div className="flex items-center text-red-600 bg-red-50 w-fit px-2.5 py-1 rounded-md text-xs font-semibold">
      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Draft
    </div>
  );
}

function offerStatusBadge(status: string) {
  switch (status) {
    case "accepted":  return <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">Accepted</Badge>;
    case "pending":   return <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100">Pending</Badge>;
    case "rejected":  return <Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100">Rejected</Badge>;
    case "withdrawn": return <Badge className="bg-slate-100 text-slate-600 border-none hover:bg-slate-100">Withdrawn</Badge>;
    default:          return <Badge variant="outline">{status}</Badge>;
  }
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: dashboard } = useGetAgentDashboard();
  const { data: listings } = useListListings();

  // Offer accept/reject
  const invalidateDashboard = () =>
    queryClient.invalidateQueries({ queryKey: getGetAgentDashboardQueryKey() });

  const acceptOffer = useAcceptOffer({ mutation: { onSuccess: invalidateDashboard } });
  const rejectOffer = useRejectOffer({ mutation: { onSuccess: invalidateDashboard } });

  // Listing delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const deleteListing = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAgentDashboardQueryKey() });
      },
    },
  });

  const activeListings      = dashboard?.activeListings ?? 0;
  const totalListings       = dashboard?.totalListings ?? 0;
  const pendingVerifications = dashboard?.pendingVerifications ?? 0;
  const totalOfferValue     = dashboard?.totalOfferValue ?? 0;
  const recentOffers        = dashboard?.recentOffers ?? [];

  const listingsByStatus = (dashboard?.listingsByStatus as Record<string, number> | undefined) ?? {};
  const verifiedCount = listingsByStatus["verified"] ?? 0;
  const verifiedPct = totalListings > 0 ? Math.round((verifiedCount / totalListings) * 100) : 0;

  const displayListings = listings?.slice(0, 5) ?? [];

  return (
    <AppLayout>
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> will be permanently removed from the platform. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteListing.mutate({ listingId: deleteTarget.id });
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitor your property portfolio and performance.</p>
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
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Live
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
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Live
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
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Live
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">PENDING REVIEWS</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{String(pendingVerifications).padStart(2, "0")}</h3>
                <div className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${pendingVerifications > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                  {pendingVerifications > 0
                    ? <><ArrowDownRight className="w-3 h-3 mr-1" /> Needs action</>
                    : <><ArrowUpRight className="w-3 h-3 mr-1" /> Clear</>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Listings by Status + Recent Offers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings by Status */}
          <Card className="lg:col-span-1 flex flex-col shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Portfolio Breakdown</CardTitle>
              <CardDescription>Listings by current status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {totalListings === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No listings yet.</p>
              ) : (
                Object.entries(listingsByStatus).map(([status, count]) => {
                  const pct = Math.round(((count as number) / totalListings) * 100);
                  const label = status.replace(/_/g, " ");
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold capitalize text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground font-medium">{count as number} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-primary h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Offers */}
          <Card className="lg:col-span-2 flex flex-col shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Recent Offers</CardTitle>
              <CardDescription>Latest offers received on your listings — accept or reject pending ones here</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {recentOffers.length === 0 ? (
                <p className="text-sm text-muted-foreground px-6 py-4">No offers yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">PROPERTY</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">BUYER</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground text-right">AMOUNT (₦)</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">STATUS</TableHead>
                      <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">DATE</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOffers.slice(0, 5).map(offer => (
                      <TableRow key={offer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-sm max-w-[130px] truncate">{offer.listingTitle}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{offer.buyerName}</TableCell>
                        <TableCell className="text-sm font-semibold text-right">{formatCurrency(offer.amount)}</TableCell>
                        <TableCell>{offerStatusBadge(offer.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(offer.createdAt)}</TableCell>
                        <TableCell>
                          {offer.status === "pending" && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 font-bold text-xs"
                                disabled={acceptOffer.isPending || rejectOffer.isPending}
                                onClick={() => acceptOffer.mutate({ offerId: offer.id })}
                              >
                                {acceptOffer.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs"
                                disabled={acceptOffer.isPending || rejectOffer.isPending}
                                onClick={() => rejectOffer.mutate({ offerId: offer.id })}
                              >
                                {rejectOffer.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Asset Inventory Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Active Asset Inventory</CardTitle>
              <CardDescription>All active properties in your portfolio.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="w-3 h-3 mr-2" /> Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">REF ID</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">PROPERTY</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">DIMENSION</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground text-right">PRICE (₦)</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground">STATUS</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                      No listings yet.{" "}
                      <Link href="/listings/create">
                        <span className="text-primary underline cursor-pointer">Create your first listing</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayListings.map(listing => (
                    <TableRow key={listing.id} className="group hover:bg-muted/30 cursor-pointer transition-colors">
                      <TableCell className="font-medium text-xs">#{listing.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {listing.title}
                          </span>
                          <span className="text-xs text-muted-foreground">{listing.city}, {listing.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{listing.areaSqm} sqm</TableCell>
                      <TableCell className="text-sm font-semibold text-right">{formatCurrency(listing.price)}</TableCell>
                      <TableCell>{statusBadge(listing.status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/marketplace/${listing.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => setDeleteTarget({ id: listing.id, title: listing.title })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {displayListings.length} of {totalListings} properties
              </p>
              <Link href="/marketplace">
                <Button variant="outline" size="sm" className="h-8 text-xs">View all</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
