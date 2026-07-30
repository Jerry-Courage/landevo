import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Lock, Download, HelpCircle, AlertCircle } from "lucide-react";
import { mockBuyerEscrows, formatCurrency } from "@/lib/mock-data";

export default function BuyerEscrow() {
  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Escrow Tracker</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your land purchase escrow transactions securely.</p>
        </div>

        <div className="space-y-8">
          {/* Escrow Card 1 (Active) */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <div className="border-b bg-muted/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-bold bg-white text-xs">ESC-294821-X</Badge>
                  <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Funds Secured in Escrow</Badge>
                </div>
                <h3 className="font-bold text-lg">Epe Waterfront Estate - Plot 42</h3>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-xs font-bold text-muted-foreground mb-1">PROGRESS</span>
                <span className="font-bold text-lg text-primary">60% Complete</span>
              </div>
            </div>
            
            <div className="bg-primary/5 px-6 py-1">
              <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden my-3">
                <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left Details */}
              <div className="flex-1 p-6 md:border-r border-b md:border-b-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">TOTAL ESCROW VALUE</p>
                    <p className="font-bold text-lg">{formatCurrency(125000000)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">CURRENT BALANCE</p>
                    <p className="font-bold text-lg text-primary">{formatCurrency(115625000)}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-xs text-amber-800 tracking-wider">ACTION REQUIRED</h4>
                  </div>
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">
                    The Land Commission is currently auditing the structural survey reports. The next 20% of funds will be released for legal titling fees upon completion.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">MANAGING AGENT</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">AS</div>
                    <div>
                      <p className="text-sm font-bold">Alex Sterling</p>
                      <p className="text-xs text-muted-foreground">Sterling Prime Real Estate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Timeline */}
              <div className="w-full md:w-[320px] bg-card p-6 flex flex-col">
                <h4 className="font-bold text-sm tracking-wider text-muted-foreground mb-6">PROCESS STEPS</h4>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border mb-8">
                  {/* Step 1 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-500 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 flex flex-col md:group-odd:items-end">
                      <p className="text-sm font-bold text-foreground">Offer Accepted</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Oct 12, 2023</p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-500 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 flex flex-col md:group-odd:items-end">
                      <p className="text-sm font-bold text-foreground">Funds Deposited</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Oct 14, 2023</p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-500 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 flex flex-col md:group-odd:items-end">
                      <p className="text-sm font-bold text-foreground">Commission Audit</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Oct 15, 2023</p>
                    </div>
                  </div>
                  {/* Step 4 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-amber-500 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 flex flex-col md:group-odd:items-end">
                      <p className="text-sm font-bold text-amber-600">Title Verification</p>
                      <p className="text-[10px] text-muted-foreground font-medium">In Progress</p>
                    </div>
                  </div>
                  {/* Step 5 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-muted bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 flex flex-col md:group-odd:items-end">
                      <p className="text-sm font-bold text-muted-foreground">Final Release</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Locked</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <Button variant="outline" className="w-full text-xs font-bold gap-2">
                    <Download className="w-4 h-4" /> Download Receipt
                  </Button>
                  <Button variant="ghost" className="w-full text-xs font-medium text-muted-foreground hover:text-foreground">
                    <HelpCircle className="w-4 h-4 mr-1" /> Need Help?
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Escrow Card 2 (Pending) */}
          <Card className="overflow-hidden border-border/60 shadow-sm opacity-80">
            <div className="border-b bg-muted/10 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-bold bg-white text-xs">ESC-295104-X</Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">Awaiting Approval</Badge>
                </div>
                <h3 className="font-bold text-lg">Prime Waterfront Commercial Plot</h3>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-xs font-bold text-muted-foreground mb-1">PROGRESS</span>
                <span className="font-bold text-lg text-slate-600">15% Complete</span>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-1">
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-3">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">TOTAL ESCROW VALUE</p>
                  <p className="font-bold text-lg text-muted-foreground">{formatCurrency(245000000)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider">STATUS</p>
                  <p className="text-sm font-bold text-slate-600">Offer made, pending Commission review.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </BuyerLayout>
  );
}
