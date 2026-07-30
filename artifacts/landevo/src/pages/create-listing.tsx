import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, MapPin, Upload, Image as ImageIcon, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";

export default function CreateListing() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Listing</h1>
            <p className="text-muted-foreground mt-1 text-sm">Add a new property to the Landevo network for verification.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-medium bg-muted">Draft ID: LDV-9082</Badge>
            <Button variant="outline" className="bg-background font-semibold"><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full py-4 border-b">
          <div className="flex items-center justify-between relative max-w-4xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10"></div>
            
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm ring-4 ring-background">1</div>
              <span className="text-[10px] font-bold tracking-wider text-primary">PROPERTY DETAILS</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm ring-4 ring-background">2</div>
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground">DOCUMENTS</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm ring-4 ring-background">3</div>
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground">PRICING</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-background px-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm ring-4 ring-background">4</div>
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground">REVIEW</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Basic Information</h3>
                  <p className="text-sm text-muted-foreground mb-6">Provide the core details of the property as stated on the title document.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center">Listing Title <span className="text-destructive ml-1">*</span></label>
                    <Input placeholder="e.g., Prime Residential Plot at Lekki Phase 1" className="h-11" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">Property Type <span className="text-destructive ml-1">*</span></label>
                      <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>Residential Land</option>
                        <option>Commercial Land</option>
                        <option>Industrial Land</option>
                        <option>Agricultural Land</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">Total Area (sqm) <span className="text-destructive ml-1">*</span></label>
                      <Input type="number" placeholder="0" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-semibold flex items-center">Detailed Description <span className="text-destructive ml-1">*</span></label>
                    <textarea 
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe the land features, topography, and potential uses..."
                    ></textarea>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Geographic Location</h3>
                  <p className="text-sm text-muted-foreground mb-6">Enter the exact address for the site inspection.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">State / Region <span className="text-destructive ml-1">*</span></label>
                      <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>Lagos State</option>
                        <option>Ogun State</option>
                        <option>FCT Abuja</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">LGA / District <span className="text-destructive ml-1">*</span></label>
                      <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>Eti-Osa</option>
                        <option>Ikeja</option>
                        <option>Ikorodu</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center">Full Site Address <span className="text-destructive ml-1">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Street address, block number, landmark..." className="pl-10 h-11" />
                    </div>
                  </div>

                  <div className="bg-muted/50 border rounded-md p-4 flex items-start gap-3 mt-4">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Precise coordinates will be pulled automatically from the Survey Plan once documents are verified by the Land Commission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Form */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm mb-4">MAIN VISUAL</h3>
                <div className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer text-center group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm mb-1">Click to upload cover photo</p>
                  <p className="text-xs text-muted-foreground">Recommended: 1200x800px, JPG/PNG</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">GALLERY (0/10)</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square rounded border border-dashed flex items-center justify-center bg-muted/10 cursor-pointer hover:bg-muted/30">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-amber-800 text-sm">Integrity Notice</h4>
              </div>
              <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                As an authorized Landevo Agent, you are legally responsible for the accuracy of listing details. Providing false information may lead to platform suspension and legal inquiry by the Land Commission.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t pb-12">
          <Link href="/dashboard">
            <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">All fields marked with <span className="text-destructive">*</span> are required</span>
            <Button className="font-bold px-8 h-11">Next: Verification →</Button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
