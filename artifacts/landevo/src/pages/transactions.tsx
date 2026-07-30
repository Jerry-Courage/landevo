import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Download, FileText, ArrowRightLeft, ShieldCheck, MapPin, CheckCircle2, Circle, AlertCircle, Phone } from "lucide-react";
import { mockTransactions, formatCurrency } from "@/lib/mock-data";
import { Link } from "wouter";

export default function Transactions() {
  return (
    <AppLayout>
      <div className="flex flex-col min-h-full bg-muted/10">
        {/* Breadcrumb & Header */}
        <div className="bg-card border-b px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="bg-background text-xs font-semibold">ESC-294821-X</Badge>
              <Badge variant="warning" className="bg-amber-100 text-amber-800 border-none text-xs font-bold px-2 py-0.5">Funds Secured in Escrow</Badge>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Escrow Detail: Epe Waterfront Estate - Plot 42</h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">Started on Oct 12, 2023 • Managed by Landevo Institutional Escrow Services</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="font-semibold bg-background"><Download className="w-4 h-4 mr-2"/> Export Ledger</Button>
                <Button className="font-semibold bg-primary text-primary-foreground"><FileText className="w-4 h-4 mr-2"/> View Purchase Agreement</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Value Card */}
              <Card className="overflow-hidden shadow-sm border-t-4 border-t-amber-500">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">TOTAL ESCROW VALUE</p>
                      <h2 className="text-3xl font-bold text-foreground">₦ 125,000,000.00</h2>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">CURRENT BALANCE</p>
                      <h2 className="text-3xl font-bold text-primary">₦ 115,625,000.00</h2>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-foreground">TRANSACTION PROGRESS</span>
                      <span className="text-sm font-bold text-primary">60% Complete</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[60%] rounded-full"></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-800 text-sm mb-1">Action Required: Title Verification</h5>
                      <p className="text-xs text-amber-700/90 leading-relaxed font-medium">The Land Commission is currently auditing the Certificate of Occupancy. No funds will be released until this step is approved.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm">Transaction Parties</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">BM</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-none">Babatunde Makanjuola</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Buyer <span className="text-green-600 ml-1">✓ Verified</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center text-xs font-bold text-white"><ShieldCheck className="w-4 h-4" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-none">Landevo Commission</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Escrow Custodian</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">AS</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-none">Alex Sterling</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Listing Agent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm">Asset Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                         <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800"></div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-sm leading-tight mb-1">Epe Waterfront Estate - Plot 42</h4>
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          Epe, Lagos State
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] font-bold">LND-9108</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-xs font-semibold h-9">View Listing →</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Ledger */}
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle>Transaction Ledger</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All Records</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs tracking-wider">REF ID</TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">DESCRIPTION</TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">DATE</TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider">TYPE</TableHead>
                        <TableHead className="font-semibold text-xs tracking-wider text-right">AMOUNT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium text-xs text-muted-foreground">{t.id}</TableCell>
                          <TableCell className="text-sm font-medium">{t.description}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.date}</TableCell>
                          <TableCell>
                            <Badge variant={t.type === 'Deposit' ? 'success' : t.type === 'Hold' ? 'warning' : 'secondary'} className="text-[10px] font-bold">
                              {t.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-right ${t.amount > 0 ? 'text-green-600' : t.amount < 0 && t.type !== 'Hold' ? 'text-foreground' : 'text-amber-600'}`}>
                            {t.amount > 0 && t.type !== 'Hold' ? '+' : ''}
                            {t.type === 'Hold' ? '' : ''}{formatCurrency(t.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Process */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-sm">Process Workflow</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6 relative">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border -z-10"></div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none mb-1">OFFER ACCEPTED</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Oct 11, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none mb-1">FUNDS DEPOSITED</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Oct 12, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none mb-1">COMMISSION AUDIT</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Oct 14, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center flex-shrink-0 mt-0.5 ring-4 ring-background"><Circle className="w-2.5 h-2.5 fill-primary" /></div>
                      <div>
                        <p className="text-sm font-bold text-primary leading-none mb-1">TITLE VERIFICATION</p>
                        <p className="text-[10px] text-primary/70 font-semibold mb-2">In Progress</p>
                        <Button size="sm" className="h-7 text-xs px-3 font-semibold">Review Audit →</Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 opacity-50">
                      <div className="w-5 h-5 rounded-full bg-background border-2 border-muted flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none mb-1">FINAL RELEASE</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Pending completion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Breakdown */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm">FINANCIAL BREAKDOWN</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Purchase Price</span>
                    <span className="font-semibold text-foreground">₦ 125,000,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Escrow Fee (0.5%)</span>
                    <span className="font-semibold text-foreground">-₦ 625,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Stamp Duty & Legal</span>
                    <span className="font-semibold text-foreground">-₦ 2,500,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-3 border-b">
                    <span className="text-muted-foreground">Agent Commission</span>
                    <span className="font-semibold text-foreground">-₦ 6,250,000</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">TOTAL TO RELEASE</span>
                    <span className="text-lg font-bold text-primary">₦ 115,625,000</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold h-11">Request Refund / Cancel</Button>
              </div>

              <Card className="bg-sidebar text-white shadow-sm border-none">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-1">Need Assistance?</h4>
                    <p className="text-xs text-sidebar-foreground/70">Escrow Support Team</p>
                  </div>
                  <Button size="icon" variant="secondary" className="rounded-full bg-white text-sidebar hover:bg-white/90">
                    <Phone className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
