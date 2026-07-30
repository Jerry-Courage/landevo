export const mockListings = [
  { id: "LND-8821", name: "Emerald Valley Phase II", location: "Lekki, Lagos", size: "600 sqm", value: 25000000, status: "Verified", date: "Oct 12, 2023", type: "Residential", state: "Lagos State" },
  { id: "LND-9812", name: "Sunset Heights Estate", location: "Ikoyi, Lagos", size: "1,200 sqm", value: 48000000, status: "Pending Audit", date: "Oct 14, 2023", type: "Residential", state: "Lagos State" },
  { id: "LND-7734", name: "Prime Industrial Zone", location: "Agbara, Ogun", size: "5,000 sqm", value: 120000000, status: "Verified", date: "Oct 15, 2023", type: "Industrial", state: "Ogun State" },
  { id: "LND-8422", name: "Riverside Garden Plots", location: "Ikorodu, Lagos", size: "450 sqm", value: 85000000, status: "Correction Required", date: "Oct 16, 2023", type: "Residential", state: "Lagos State" },
  { id: "LND-9108", name: "Oakwood Residential", location: "Epe, Lagos", size: "900 sqm", value: 15000000, status: "Verified", date: "Oct 17, 2023", type: "Residential", state: "Lagos State" },
  { id: "LND-3392", name: "Hilltop Agricultural Acreage", location: "Abeokuta, Ogun", size: "10,000 sqm", value: 35000000, status: "Verified", date: "Oct 18, 2023", type: "Agricultural", state: "Ogun State" },
  { id: "LND-4411", name: "Prime Waterfront Commercial Plot", location: "Victoria Island, Lagos", size: "2,400 sqm", value: 245000000, status: "Verified", date: "Oct 19, 2023", type: "Commercial", state: "Lagos State" },
  { id: "LND-5512", name: "Suburban Family Plot", location: "Sangotedo, Lagos", size: "500 sqm", value: 12000000, status: "Verified", date: "Oct 20, 2023", type: "Residential", state: "Lagos State" },
  { id: "LND-6613", name: "Tech Park Designated Land", location: "Yaba, Lagos", size: "1,500 sqm", value: 85000000, status: "Verified", date: "Oct 21, 2023", type: "Commercial", state: "Lagos State" },
];

export const mockTransactions = [
  { id: "TXN-001", description: "Initial Deposit - Buyer Wallet", date: "Oct 12, 2023", type: "Deposit", amount: 125000000.00 },
  { id: "TXN-002", description: "Escrow Service Fee", date: "Oct 12, 2023", type: "Fee", amount: -625000.00 },
  { id: "TXN-003", description: "Survey Verification Disbursement", date: "Oct 14, 2023", type: "Payout", amount: -8750000.00 },
  { id: "TXN-004", description: "Legal Documentation Retainer", date: "Oct 15, 2023", type: "Hold", amount: 5000000.00 },
];

export const mockMessages = [
  { id: "MSG-1", name: "Sarah Jenkins", text: "I am interested in the Victoria Island plot. Is the price ne...", role: "Buyer", unread: true, time: "10:42 AM", verified: true },
  { id: "MSG-2", name: "Michael Chen", text: "Could you send over the survey plan for the Lekki Phase...", role: "Buyer", unread: false, time: "Yesterday", verified: false },
  { id: "MSG-3", name: "Land Commission Admin", text: "Your listing for Epe Forest View has been approved for m...", role: "Commission Officer", unread: false, time: "Oct 22", verified: true },
];

export const mockNotifications = [
  { id: 1, type: "URGENT", title: "Escrow Payment Confirmed", desc: "The initial deposit of ₦15,000,000 for the Victoria Island Plot has been successfully secured in escrow.", time: "2 mins ago", link: "View Transaction →", linkId: "ESC-99201" },
  { id: 2, type: "IMPORTANT", title: "New Message from Sarah Jenkins", desc: "I have reviewed the survey documents you sent over. Can we schedule a site visit for Thursday morning?", time: "15 mins ago", link: "Reply now →" },
  { id: 3, type: "URGENT", title: "Agent Verification Approved", desc: "Your professional credentials have been verified by the Land Commission. You now have full access to premium listings.", time: "2 hours ago" },
  { id: 4, type: "DEFAULT", title: "Listing Update: Price Change", desc: "The listing 'Prime Commercial Plot - Lekki Phase 1' has been updated with a new price of ₦85,000,000.", time: "5 hours ago", link: "Check Listing →" },
  { id: 5, type: "IMPORTANT", title: "Security Alert: New Login", desc: "A new login was detected from a Chrome browser on Windows (Lagos, Nigeria). If this wasn't you, please reset your password.", time: "1 day ago" },
  { id: 6, type: "URGENT", title: "Document Signature Required", desc: "Your signature is required on the Escrow Agreement for Plot 42.", time: "1 day ago", link: "Sign Document →" },
];

export const mockBuyerOffers = [
  { id: "OFF-1", propertyId: "LND-4411", propertyName: "Prime Waterfront Commercial Plot", location: "Lekki Phase 1", amount: 245000000, status: "ACCEPTED", date: "Oct 24, 2023", expiry: "" },
  { id: "OFF-2", propertyId: "LND-8821", propertyName: "Emerald Valley Phase II", location: "Lekki", amount: 22500000, status: "UNDER REVIEW", date: "Oct 20, 2023", expiry: "expires in 5 days" },
  { id: "OFF-3", propertyId: "LND-5512", propertyName: "Suburban Family Plot", location: "Sangotedo", amount: 11000000, status: "PENDING", date: "Oct 18, 2023", expiry: "expires in 7 days" }
];

export const mockBuyerEscrows = [
  { id: "ESC-294821-X", propertyName: "Epe Waterfront Estate - Plot 42", amount: 125000000, balance: 115625000, progress: 60, status: "Funds Secured in Escrow", agent: "Alex Sterling (Sterling Prime Real Estate)" },
  { id: "ESC-295104-X", propertyName: "Prime Waterfront Commercial Plot", amount: 245000000, balance: 245000000, progress: 15, status: "Awaiting Approval", agent: "Alex Sterling (Sterling Prime Real Estate)" }
];

export const mockBuyerNotifications = [
  { id: 1, type: "URGENT", title: "Offer Accepted", desc: "Your offer of ₦245,000,000 for Prime Waterfront Commercial Plot has been accepted by the agent. Proceed to escrow.", time: "10 mins ago", link: "Proceed to Escrow →" },
  { id: 2, type: "IMPORTANT", title: "Escrow Update", desc: "Commission audit for Epe Waterfront Estate Plot 42 is 60% complete. Estimated completion: Nov 3, 2023.", time: "1 hour ago" },
  { id: 3, type: "DEFAULT", title: "Site Visit Confirmed", desc: "Your site visit for Emerald Valley Phase II is confirmed for Thursday, Oct 26, 2023 at 10:00 AM.", time: "3 hours ago" },
  { id: 4, type: "IMPORTANT", title: "New Message from Alex Sterling", desc: "I've submitted your offer to the seller and expect a response by tomorrow morning.", time: "5 hours ago" },
  { id: 5, type: "DEFAULT", title: "Identity Verification Approved", desc: "Your government ID and biometric verification have been approved. You now have full access to verified listings.", time: "1 day ago" },
  { id: 6, type: "DEFAULT", title: "Price Alert", desc: "A property in your saved list 'Prime Industrial Zone' has reduced its price to ₦110,000,000.", time: "2 days ago" },
];

export const mockBuyerMessages = [
  { id: "MSG-B1", name: "Alex Sterling (Agent)", text: "Good morning Babatunde! Yes, the seller has authorized...", role: "Agent", unread: true, time: "9:31 AM", verified: true },
  { id: "MSG-B2", name: "Landevo Support", text: "Your escrow transaction ESC-294821-X has been...", role: "Support", unread: false, time: "Yesterday", verified: true },
  { id: "MSG-B3", name: "Land Commission Office", text: "Your identity verification has been approved...", role: "Commission", unread: false, time: "Oct 22", verified: true },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount).replace('NGN', '₦');
};
