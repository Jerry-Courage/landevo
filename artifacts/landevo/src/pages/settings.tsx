import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Info } from "lucide-react";

export default function Settings() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your professional profile, preferences, and security settings.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0 mb-8 overflow-x-auto">
            <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">Public Profile</TabsTrigger>
            <TabsTrigger value="verification" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">Verification</TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">Security</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-6 font-semibold">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Agent Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">This image will be visible to buyers and government officials on your listings.</p>
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-sidebar flex items-center justify-center font-bold text-white text-3xl border-4 border-background shadow-md">
                        AS
                      </div>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="font-semibold h-9"><Upload className="w-3.5 h-3.5 mr-2" /> Upload new</Button>
                        <Button variant="ghost" size="sm" className="font-semibold h-9 text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3 flex items-start gap-2 border">
                        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground font-medium">Professional headshots increase trust by 40% in real estate transactions.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Basic Details</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Your professional name and agency affiliation.</p>
                  </div>
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Full Legal Name</label>
                      <Input defaultValue="Alex Sterling" className="max-w-md h-10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Agency Name</label>
                      <Input defaultValue="Sterling Prime Real Estate" className="max-w-md h-10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Professional Bio</label>
                      <textarea 
                        className="flex min-h-[100px] w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        defaultValue="Senior Land Consultant with 12+ years of experience in the Lagos metropolitan area. Specializing in high-value commercial plots and residential developments."
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-sm mb-1">Official Contact</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Primary methods for buyers and the Commission to reach you.</p>
                  </div>
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Official Email</label>
                      <Input type="email" defaultValue="alex.sterling@landevo-agents.com" className="max-w-md h-10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Phone Number</label>
                      <Input type="tel" defaultValue="+234 802 123 4567" className="max-w-md h-10" />
                    </div>
                    <Button className="mt-4 font-bold">Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
