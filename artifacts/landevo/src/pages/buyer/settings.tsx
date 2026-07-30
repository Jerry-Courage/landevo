import React from "react";
import BuyerLayout from "@/components/buyer-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, ShieldCheck, Mail, Phone, Building, Info, Upload, Trash2 } from "lucide-react";

export default function BuyerSettings() {
  return (
    <BuyerLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your buyer identity and investment preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent gap-0 mb-6">
            <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-1 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground transition-colors">
              Personal Profile
            </TabsTrigger>
            <TabsTrigger value="kyc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-1 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground transition-colors">
              KYC Verification
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-1 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground transition-colors">
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-1 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground transition-colors">
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Personal Profile */}
          <TabsContent value="profile" className="mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">

            {/* Buyer Identity */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Buyer Identity</CardTitle>
                <CardDescription>Your official profile details as registered with Landevo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar section */}
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
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Babatunde Makanjuola</h3>
                      <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 font-bold">VERIFIED INVESTOR</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-muted-foreground gap-1.5 hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-md p-3 text-xs text-muted-foreground max-w-xs">
                      <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      Use a clear photo. Verified buyers receive priority consideration from agents.
                    </div>
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
                      <option>Corporate / Institutional</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider">BUYER BIO (OPTIONAL)</label>
                    <textarea
                      rows={3}
                      defaultValue="Institutional property investor focused on verified commercial and residential land acquisitions across Lagos and Abuja."
                      className="flex w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
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
                <div className="flex justify-end pt-2">
                  <Button className="font-bold px-6 bg-primary hover:bg-primary/90 h-10 shadow-sm">Save Changes</Button>
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

                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground tracking-wider block mb-3">PREFERRED LAND TYPE</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Residential", checked: true },
                      { label: "Commercial", checked: true },
                      { label: "Industrial", checked: false },
                      { label: "Agricultural", checked: false },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer border transition-colors ${
                          opt.checked
                            ? "bg-primary/5 border-primary/20"
                            : "bg-background border-input"
                        }`}
                      >
                        <input type="checkbox" defaultChecked={opt.checked} className="rounded text-primary" />
                        <span className={`text-sm font-${opt.checked ? "bold text-primary" : "medium"}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground tracking-wider block mb-3">PREFERRED LOCATIONS</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Lagos State", checked: true },
                      { label: "Abuja FCT", checked: true },
                      { label: "Ogun State", checked: false },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer border transition-colors ${
                          opt.checked
                            ? "bg-primary/5 border-primary/20"
                            : "bg-background border-input"
                        }`}
                      >
                        <input type="checkbox" defaultChecked={opt.checked} className="rounded text-primary" />
                        <span className={`text-sm font-${opt.checked ? "bold text-primary" : "medium"}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="font-bold px-8 bg-primary hover:bg-primary/90 h-11 shadow-sm">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC tab placeholder */}
          <TabsContent value="kyc" className="mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>Identity documents and verification status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Identity Verified</p>
                    <p className="text-xs text-green-600 mt-0.5">Your NIN and CAC documents have been approved by our compliance team.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab placeholder */}
          <TabsContent value="security" className="mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Password, 2FA, and session management.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-sm font-semibold">Password</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs font-semibold">Change Password</Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs font-semibold">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications tab placeholder */}
          <TabsContent value="notifications" className="mt-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what you hear about and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New verified property matches", desc: "Properties that match your preferences", on: true },
                  { label: "Offer status updates", desc: "When your offers are reviewed or accepted", on: true },
                  { label: "Escrow milestones", desc: "Progress updates on active escrows", on: true },
                  { label: "Agent messages", desc: "New messages from agents", on: true },
                  { label: "Platform announcements", desc: "News and feature updates from Landevo", on: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${item.on ? "bg-primary" : "bg-muted"}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${item.on ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </BuyerLayout>
  );
}
