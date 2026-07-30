import React, { useState } from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, MapPin } from "lucide-react";
import { mockBuyerOffers, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

export default function BuyerOffers() {
  const [filter, setFilter] = useState("All");

  const filters = [
    { label: "All", count: mockBuyerOffers.length },
    { label: "Accepted", count: mockBuyerOffers.filter(o => o.status === "ACCEPTED").length },
    { label: "Under Review", count: mockBuyerOffers.filter(o => o.status === "UNDER REVIEW").length },
    { label: "Pending", count: mockBuyerOffers.filter(o => o.status === "PENDING").length },
    { label: "Rejected", count: 0 },
  ];

  const filteredOffers = filter === "All" 
    ? mockBuyerOffers 
    : mockBuyerOffers.filter(o => o.status === filter.toUpperCase());

  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Offers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track all your property offer submissions.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b overflow-x-auto hide-scrollbar">
          {filters.map((f) => (
            <button 
              key={f.label} 
              onClick={() => setFilter(f.label)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${filter === f.label ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {f.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === f.label ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map((offer, i) => (
            <div key={offer.id} className="bg-card border rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
              {/* Left: Thumbnail */}
              <div className="w-full md:w-48 h-32 md:h-auto relative flex-shrink-0 bg-muted">
                <div className={`absolute inset-0 bg-gradient-to-br ${i%2===0 ? 'from-slate-700 to-teal-900' : 'from-green-900 to-slate-800'}`}></div>
              </div>
              
              {/* Center: Details */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-bold bg-muted/50">REF: {offer.propertyId}</Badge>
                    <span className="text-xs text-muted-foreground font-medium">Submitted {offer.date}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{offer.propertyName}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3 mr-1" /> {offer.location}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">OFFER AMOUNT</p>
                  <p className="text-xl font-bold">{formatCurrency(offer.amount)}</p>
                </div>
              </div>

              {/* Right: Actions/Status */}
              <div className="w-full md:w-56 p-5 bg-muted/20 border-l flex flex-col justify-center gap-3">
                <div className="mb-2">
                  {offer.status === "ACCEPTED" && <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">ACCEPTED</Badge>}
                  {offer.status === "UNDER REVIEW" && <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">UNDER REVIEW</Badge>}
                  {offer.status === "PENDING" && <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-slate-300">PENDING</Badge>}
                </div>
                
                {offer.status === "ACCEPTED" ? (
                  <Link href="/buyer/escrow">
                    <Button className="w-full font-bold bg-[#1B4332] hover:bg-[#1B4332]/90">View Escrow</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full font-bold border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive">
                    Withdraw Offer
                  </Button>
                )}

                {offer.expiry && (
                  <p className="text-[10px] font-semibold text-center text-muted-foreground mt-1">
                    {offer.expiry}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {filteredOffers.length === 0 && (
            <div className="text-center py-12 bg-card border rounded-lg">
              <p className="text-muted-foreground font-medium">No offers found for this status.</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mt-8">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-blue-900 leading-relaxed">
            All offers are legally binding once accepted by the agent and reviewed by the Land Commission. Escrow funds are deposited automatically upon acceptance to initiate the transaction.
          </p>
        </div>
      </div>
    </BuyerLayout>
  );
}
