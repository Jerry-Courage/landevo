import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, ShieldCheck, Mail, Phone, MapPin, Building, Lock } from "lucide-react";

export default function BuyerSettings() {
  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your buyer identity and investment preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Settings Tabs Sidebar */}
          <div className="w-full md:w-[220px] shrink-0 space-y-1">
            <Button variant="ghost" className="w-full justify-start font-bold bg-muted">Personal Profile</Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">KYC Verification</Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">Security</Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">Notifications</Button>
          </div>

          {/* Main Settings Content */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* Buyer Identity Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Buyer Identity</CardTitle>
                <CardDescription>Your official profile details as registered with Landevo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center font-bold text-2xl text-slate-500 overflow-hidden">
                      BM
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Babatunde Makanjuola</h3>
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 font-bold">VERIFIED INVESTOR</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">FULL LEGAL NAME</label>
                    <Input defaultValue="Babatunde Makanjuola" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">COMPANY / ORGANIZATION (OPTIONAL)</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input defaultValue="BM Capital Investments Ltd" className="pl-9 bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">BUYER TYPE</label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option>Individual Investor</option>
                      <option selected>Corporate / Institutional</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>How agents and support can reach you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">OFFICIAL EMAIL</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input defaultValue="b.makanjuola@bmcapital.ng" className="pl-9 bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">PHONE NUMBER</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input defaultValue="+234 803 123 4567" className="pl-9 bg-muted/50" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Preferences */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Investment Preferences</CardTitle>
                <CardDescription>We'll use this to match you with the best verified properties.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground tracking-wider block mb-4">BUDGET RANGE (₦)</label>
                    <div className="flex items-center gap-4">
                      <Input defaultValue="10,000,000" className="w-32 text-center font-bold" />
                      <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 ml-[10%] rounded-full"></div>
                      </div>
                      <Input defaultValue="300,000,000" className="w-32 text-center font-bold" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider block mb-3">PREFERRED LAND TYPE</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-primary text-primary" />
                        <span className="text-sm font-bold text-primary">Residential</span>
                      </label>
                      <label className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-primary text-primary" />
                        <span className="text-sm font-bold text-primary">Commercial</span>
                      </label>
                      <label className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-input text-primary" />
                        <span className="text-sm font-medium">Industrial</span>
                      </label>
                      <label className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-input text-primary" />
                        <span className="text-sm font-medium">Agricultural</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider block mb-3">PREFERRED LOCATIONS</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-primary text-primary" />
                        <span className="text-sm font-bold text-primary">Lagos State</span>
                      </label>
                      <label className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-primary text-primary" />
                        <span className="text-sm font-bold text-primary">Abuja FCT</span>
                      </label>
                      <label className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-input text-primary" />
                        <span className="text-sm font-medium">Ogun State</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button className="font-bold px-8 bg-[#1B4332] hover:bg-[#1B4332]/90 h-11 shadow-sm">Save Preferences</Button>
            </div>
            
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
