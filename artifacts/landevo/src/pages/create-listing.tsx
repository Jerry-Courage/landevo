import React, { useState } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCreateListing, getListListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PROPERTY_TYPES = [
  { value: "land", label: "Land" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "apartment", label: "Apartment" },
] as const;

type PropertyType = typeof PROPERTY_TYPES[number]["value"];

export default function CreateListing() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("land");
  const [error, setError] = useState("");

  const createListing = useCreateListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        navigate("/dashboard");
      },
      onError: (err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to create listing.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !price || !location || !address || !city || !state || !areaSqm) {
      setError("Please fill in all required fields.");
      return;
    }
    createListing.mutate({
      data: {
        title,
        description,
        price: parseFloat(price),
        location,
        address,
        city,
        state,
        areaSqm: parseFloat(areaSqm),
        propertyType,
        ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
        ...(bathrooms ? { bathrooms: parseInt(bathrooms) } : {}),
        images: [],
      },
    });
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Listing</h1>
              <p className="text-muted-foreground mt-1 text-sm">Add a new property to the Landevo network for verification.</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="font-medium bg-muted">New Draft</Badge>
              <Button
                type="submit"
                variant="outline"
                className="bg-background font-semibold"
                disabled={createListing.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createListing.isPending ? "Saving…" : "Save Draft"}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full py-4 border-b">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
              {["PROPERTY DETAILS", "DOCUMENTS", "PRICING", "REVIEW"].map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ring-4 ring-background shadow-sm ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 text-sm font-medium">
              {error}
            </div>
          )}

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
                      <label className="text-sm font-semibold flex items-center">
                        Listing Title <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. 2,500 sqm Commercial Plot, Victoria Island"
                        className="h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">
                        Description <span className="text-destructive ml-1">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the property in detail — boundaries, access roads, utilities, nearby landmarks…"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">
                          Property Type <span className="text-destructive ml-1">*</span>
                        </label>
                        <select
                          value={propertyType}
                          onChange={e => setPropertyType(e.target.value as PropertyType)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {PROPERTY_TYPES.map(pt => (
                            <option key={pt.value} value={pt.value}>{pt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">
                          Area (sqm) <span className="text-destructive ml-1">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={areaSqm}
                          onChange={e => setAreaSqm(e.target.value)}
                          placeholder="e.g. 2500"
                          className="h-10"
                          required
                        />
                      </div>
                    </div>

                    {(propertyType === "residential" || propertyType === "apartment") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Bedrooms</label>
                          <Input
                            type="number"
                            min="0"
                            value={bedrooms}
                            onChange={e => setBedrooms(e.target.value)}
                            placeholder="e.g. 4"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Bathrooms</label>
                          <Input
                            type="number"
                            min="0"
                            value={bathrooms}
                            onChange={e => setBathrooms(e.target.value)}
                            placeholder="e.g. 3"
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Location</h3>
                    <p className="text-sm text-muted-foreground mb-6">Provide the exact location details for mapping and verification.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">
                        Street Address <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="e.g. 15 Kofo Abayomi Street"
                        className="h-10"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">
                          City / LGA <span className="text-destructive ml-1">*</span>
                        </label>
                        <Input
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="e.g. Victoria Island"
                          className="h-10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">
                          State <span className="text-destructive ml-1">*</span>
                        </label>
                        <Input
                          value={state}
                          onChange={e => setState(e.target.value)}
                          placeholder="e.g. Lagos"
                          className="h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">
                        Location Description <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Victoria Island, Lagos — near Eko Hotel"
                        className="h-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Pricing</h3>
                    <p className="text-sm text-muted-foreground mb-6">Set the asking price in Nigerian Naira (₦).</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center">
                      Asking Price (₦) <span className="text-destructive ml-1">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="e.g. 250000000"
                      className="h-10"
                      required
                    />
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

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <Card className="shadow-sm sticky top-6">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-sm border-b pb-3">Listing Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Title</p>
                      <p className="font-semibold mt-0.5 text-foreground truncate">{title || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Type</p>
                      <p className="font-semibold mt-0.5 capitalize">{propertyType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Location</p>
                      <p className="font-semibold mt-0.5">{city && state ? `${city}, ${state}` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Area</p>
                      <p className="font-semibold mt-0.5">{areaSqm ? `${areaSqm} sqm` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Asking Price</p>
                      <p className="font-semibold mt-0.5 text-primary">
                        {price ? `₦${parseFloat(price).toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t pb-12">
            <Link href="/dashboard">
              <Button variant="ghost" type="button" className="font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Fields marked <span className="text-destructive">*</span> are required
              </span>
              <Button
                type="submit"
                className="font-bold px-8 h-11"
                disabled={createListing.isPending}
              >
                {createListing.isPending ? "Creating…" : "Create Listing"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
