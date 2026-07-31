import React, { useState, useRef } from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, AlertTriangle, Upload, X, ImageIcon, CheckCircle2, Loader2, Send, FileText } from "lucide-react";

interface ListingDocument {
  name: string;
  url: string;
  contentType: string;
}
import { Link, useLocation } from "wouter";
import { useCreateListing, useSubmitListingForVerification, getListListingsQueryKey } from "@workspace/api-client-react";
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

  // Image upload
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document upload
  const [uploadedDocuments, setUploadedDocuments] = useState<ListingDocument[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Post-creation state
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);

  const submitForVerification = useSubmitListingForVerification({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        navigate("/dashboard");
      },
    },
  });

  const createListing = useCreateListing({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        setCreatedListingId(data.id);
      },
      onError: (err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to create listing.");
      },
    },
  });

  const handleDocumentUpload = async (files: FileList) => {
    setUploadingDocs(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("contentType", file.type || "application/octet-stream");
      form.append("size", String(file.size));
      try {
        const res = await fetch("/api/storage/uploads", { method: "POST", body: form, credentials: "include" });
        if (res.ok) {
          const { uploadURL } = await res.json() as { uploadURL: string };
          setUploadedDocuments(prev => [...prev, { name: file.name, url: uploadURL, contentType: file.type || "application/octet-stream" }]);
        }
      } catch { /* skip */ }
    }
    setUploadingDocs(false);
    if (docFileInputRef.current) docFileInputRef.current.value = "";
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("contentType", file.type);
      form.append("size", String(file.size));
      try {
        const res = await fetch("/api/storage/uploads", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (res.ok) {
          const { uploadURL } = await res.json() as { uploadURL: string };
          newUrls.push(uploadURL);
        }
      } catch { /* skip failed file */ }
    }
    setUploadedImages(prev => [...prev, ...newUrls]);
    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
        images: uploadedImages,
        documents: uploadedDocuments,
      },
    });
  };

  // Post-creation: let agent submit for verification or save as draft
  if (createdListingId !== null) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 max-w-2xl mx-auto w-full flex flex-col items-center text-center gap-6 py-20">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Listing Created</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm">
              Your draft has been saved. Submit it for Commission review to make it live on the marketplace,
              or come back to it later from your dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button
              className="flex-1 font-bold h-11"
              disabled={submitForVerification.isPending}
              onClick={() => submitForVerification.mutate({ listingId: createdListingId })}
            >
              {submitForVerification.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Submit for Verification</>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-semibold h-11"
              onClick={() => navigate("/dashboard")}
            >
              Save as Draft
            </Button>
          </div>
          {submitForVerification.isError && (
            <p className="text-sm text-destructive font-medium">
              Could not submit — try again from the dashboard.
            </p>
          )}
        </div>
      </AppLayout>
    );
  }

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
                disabled={createListing.isPending || uploading || uploadingDocs}
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
              {["PROPERTY DETAILS", "PHOTOS", "PRICING", "REVIEW"].map((step, i) => (
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
            <div className="lg:col-span-2 space-y-8">

              {/* Basic Info */}
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
                          type="number" min="0"
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
                          <Input type="number" min="0" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="e.g. 4" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Bathrooms</label>
                          <Input type="number" min="0" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="e.g. 3" className="h-10" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
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
                      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 15 Kofo Abayomi Street" className="h-10" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">City / LGA <span className="text-destructive ml-1">*</span></label>
                        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Victoria Island" className="h-10" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center">State <span className="text-destructive ml-1">*</span></label>
                        <Input value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Lagos" className="h-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center">
                        Location Description <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Victoria Island, Lagos — near Eko Hotel" className="h-10" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card className="shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Property Photos</h3>
                    <p className="text-sm text-muted-foreground">Upload clear photos — they increase buyer confidence and speed up verification.</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && handleImageUpload(e.target.files)}
                  />

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedImages.map((url, i) => (
                        <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
                          <img src={url} alt={`Property photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                              COVER
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-muted/30 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold">{uploading ? "Uploading photos…" : "Click to add photos"}</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG — up to 20 MB each</p>
                    </div>
                  </button>

                  {uploadedImages.length === 0 && !uploading && (
                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Photos are optional but strongly recommended.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Property Documents */}
              <Card className="shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Property Documents</h3>
                    <p className="text-sm text-muted-foreground">Upload legal documents to support verification — title deeds, survey plans, certificates of occupancy, etc.</p>
                  </div>

                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && handleDocumentUpload(e.target.files)}
                  />

                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium flex-1 truncate">{doc.name}</span>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline flex-shrink-0">View</a>
                          <button
                            type="button"
                            onClick={() => setUploadedDocuments(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    disabled={uploadingDocs}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-muted/30 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {uploadingDocs ? (
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold">{uploadingDocs ? "Uploading documents…" : "Click to add documents"}</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG — up to 20 MB each</p>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Pricing */}
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
                      type="number" min="0"
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
                    {uploadedImages.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Photos</p>
                        <p className="font-semibold mt-0.5">{uploadedImages.length} uploaded</p>
                      </div>
                    )}
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
                disabled={createListing.isPending || uploading || uploadingDocs}
              >
                {createListing.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : uploading || uploadingDocs ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                ) : "Create Listing"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
