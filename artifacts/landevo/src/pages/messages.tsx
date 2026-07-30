import React from "react";
import AppLayout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Phone, Video, Info, MoreVertical, Paperclip, Image as ImageIcon, Send, ShieldCheck, MapPin } from "lucide-react";
import { mockMessages } from "@/lib/mock-data";

export default function Messages() {
  return (
    <AppLayout>
      <div className="flex h-full w-full bg-background overflow-hidden">
        
        {/* Left Panel - Inbox */}
        <div className="w-[300px] flex-shrink-0 border-r flex flex-col bg-card">
          <div className="p-4 border-b flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8"><Filter className="w-4 h-4" /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search inbox..." className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:ring-1" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {mockMessages.map((msg, i) => (
              <div key={msg.id} className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 ${i === 0 ? 'bg-primary/5' : ''}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm border shadow-sm">
                    {msg.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {msg.unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm truncate pr-2 ${msg.unread ? 'font-bold' : 'font-semibold'}`}>{msg.name}</h4>
                    <span className={`text-[10px] flex-shrink-0 ${msg.unread ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>{msg.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{msg.role}</span>
                    {msg.verified && <ShieldCheck className="w-3 h-3 text-green-600" />}
                  </div>
                  <p className={`text-xs truncate ${msg.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel - Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
          {/* Chat Header */}
          <div className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm border">
                  SJ
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Sarah Jenkins</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="w-4 h-4" /></Button>
              <div className="w-px h-6 bg-border mx-1"></div>
              <Button variant="ghost" size="icon" className="text-muted-foreground"><Info className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-background text-[10px] font-semibold text-muted-foreground px-3 py-1">TODAY</Badge>
            </div>

            <div className="flex justify-center my-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-md w-full flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary tracking-wider mb-0.5">INQUIRY FOR PROPERTY</p>
                  <p className="font-bold text-sm text-foreground">Prime Residential Land Plot</p>
                  <p className="text-xs font-semibold text-muted-foreground">₦ 45,000,000</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white">View</Button>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs flex-shrink-0 border mt-1">SJ</div>
              <div>
                <div className="bg-card border rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm">
                  Hello! I saw your listing for the Prime Residential Land Plot in Victoria Island.
                </div>
                <span className="text-[10px] text-muted-foreground font-medium ml-1 mt-1 block">10:30 AM</span>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%] ml-auto justify-end">
              <div className="text-right">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 shadow-sm text-sm">
                  Hi Sarah! Yes, it's one of our most premium listings. Would you like more details or to schedule a site visit?
                </div>
                <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                  <span className="text-[10px] text-muted-foreground font-medium">10:35 AM</span>
                  <span className="text-[10px] text-primary font-bold">✓✓</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs flex-shrink-0 border mt-1">SJ</div>
              <div>
                <div className="bg-card border rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm">
                  I am interested in the Victoria Island plot. Is the price negotiable? I also wanted to confirm if the C of O is fully processed.
                </div>
                <span className="text-[10px] text-muted-foreground font-medium ml-1 mt-1 block">10:42 AM</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-card border-t">
            <div className="flex items-end gap-3 bg-muted/30 border rounded-lg p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="flex gap-1 pb-1 pl-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:bg-background"><Paperclip className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:bg-background"><ImageIcon className="w-4 h-4" /></Button>
              </div>
              <textarea 
                className="flex-1 bg-transparent border-none focus:outline-none resize-none min-h-[40px] max-h-[120px] text-sm py-2 px-1"
                placeholder="Type a message..."
                rows={1}
              ></textarea>
              <Button size="icon" className="w-9 h-9 rounded-md mb-0.5"><Send className="w-4 h-4 ml-0.5" /></Button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[10px] text-muted-foreground font-medium">Press Enter to send, Shift + Enter for new line</span>
              <div className="flex gap-3">
                <span className="text-[10px] font-bold text-muted-foreground flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-primary"/> Escrow Secure</span>
                <span className="text-[10px] font-bold text-muted-foreground flex items-center">⏱ Average response: 1h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Contact Info */}
        <div className="w-[260px] flex-shrink-0 border-l bg-card flex flex-col hidden lg:flex">
          <div className="p-6 border-b flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center font-bold text-2xl border-4 border-background shadow-sm mb-3">
              SJ
            </div>
            <h3 className="font-bold text-lg leading-tight">Sarah Jenkins</h3>
            <Badge variant="outline" className="mt-2 text-[10px] font-bold tracking-wider">BUYER</Badge>
            <p className="text-xs text-muted-foreground mt-3 font-medium">Member since May 2023 • 12 Transactions Completed</p>
          </div>
          
          <div className="p-5 border-b space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">VERIFICATION STATUS</p>
              <div className="flex items-start gap-2 bg-green-50 p-2.5 rounded-md border border-green-100">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-green-800 leading-tight">Identity Verified — Government ID & Biometrics</p>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">LINKED PROPERTY</p>
              <div className="border rounded-md overflow-hidden group cursor-pointer">
                <div className="h-20 bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 group-hover:scale-105 transition-transform"></div>
                </div>
                <div className="p-2.5 bg-background">
                  <h4 className="text-xs font-bold truncate mb-0.5">Prime Residential Land Plot</h4>
                  <p className="text-[10px] text-primary font-bold">₦ 45,000,000</p>
                  <p className="text-[10px] text-muted-foreground mt-1 hover:underline">View listing details →</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">QUICK ACTIONS</p>
            <button className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors py-1">
              Shared Media <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="flex items-center justify-between w-full text-sm font-semibold hover:text-primary transition-colors py-1">
              Documents <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-auto p-5 border-t space-y-2">
            <button className="w-full text-left text-xs font-semibold text-destructive hover:underline py-1">Report User</button>
            <button className="w-full text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1">Mute Notifications</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Just to fix ChevronRight which isn't imported from lucide-react in this file
import { ChevronRight } from "lucide-react";
