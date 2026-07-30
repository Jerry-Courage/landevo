import React from "react";
import AppLayout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Plus, Search, Filter, Terminal, ShieldAlert, Activity, ShieldCheck, ShieldX } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const growthData = [
  { name: 'M1', users: 10000, revenue: 5.2 },
  { name: 'M2', users: 11200, revenue: 5.8 },
  { name: 'M3', users: 12100, revenue: 6.4 },
  { name: 'M4', users: 12800, revenue: 7.1 },
  { name: 'M5', users: 13500, revenue: 7.8 },
  { name: 'M6', users: 14284, revenue: 8.4 },
];

export default function Admin() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System Administration</h1>
            <p className="text-muted-foreground mt-1 text-sm">Global oversight, platform security, and audit management for Landevo.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-semibold bg-background"><Download className="w-4 h-4 mr-2"/> Export Logs</Button>
            <Button className="font-semibold"><Plus className="w-4 h-4 mr-2"/> Provision User</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-t-2 border-t-primary">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">TOTAL ACTIVE USERS</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">14,284</h3>
                <span className="text-xs font-bold text-green-600">+12.9%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">VERIFIED AGENTS</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">2,841</h3>
                <span className="text-xs font-bold text-green-600">+5.2%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">ESCROW VOLUME (₦)</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">8.4B</h3>
                <span className="text-xs font-bold text-red-600">-2.1%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-t-2 border-t-green-500 bg-green-50/30">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1">SYSTEM UPTIME</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-green-800">99.98%</h3>
                <Badge variant="success" className="text-[10px] py-0 border-none">STABLE</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform Growth</CardTitle>
                <p className="text-xs text-muted-foreground">User Growth vs Platform Revenue (H2)</p>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(145 45% 22%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(145 45% 22%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="users" stroke="hsl(145 45% 22%)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-base">Access Management</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Manage staff accounts and external service providers.</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Find user..." className="h-8 w-40 pl-8 pr-3 rounded text-xs border bg-muted/50 focus:outline-none focus:border-primary" />
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8"><Filter className="w-3.5 h-3.5"/></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-bold tracking-wider">USER IDENTITY</TableHead>
                      <TableHead className="text-[10px] font-bold tracking-wider">ACCESS LEVEL</TableHead>
                      <TableHead className="text-[10px] font-bold tracking-wider">STATUS</TableHead>
                      <TableHead className="text-[10px] font-bold tracking-wider text-right">LAST ACTIVITY</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <p className="text-sm font-bold">Chidi Okoro</p>
                        <p className="text-[10px] text-muted-foreground">USR-9821 • c.okoro@landevo.com</p>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground">Commission Officer</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] border-none">ACTIVE</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground text-right font-medium">2 mins ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <p className="text-sm font-bold">Sarah Mensah</p>
                        <p className="text-[10px] text-muted-foreground">USR-4412 • sarah.m@realtyplus.gh</p>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground">Real Estate Agent</TableCell>
                      <TableCell><Badge variant="warning" className="text-[10px] border-none">PENDING</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground text-right font-medium">1 hour ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <p className="text-sm font-bold">Olamide Adeyemi</p>
                        <p className="text-[10px] text-muted-foreground">USR-2190</p>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground">Buyer</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] border-none">ACTIVE</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground text-right font-medium">12 hours ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <p className="text-sm font-bold text-primary">John Dowson</p>
                        <p className="text-[10px] text-muted-foreground">USR-1102 • j.dowson@admin.landevo</p>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-primary">System Admin</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px] border-none">ACTIVE</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground text-right font-medium">Just now</TableCell>
                    </TableRow>
                    <TableRow className="bg-destructive/5 opacity-75">
                      <TableCell>
                        <p className="text-sm font-bold text-destructive">Fatima Yusuf</p>
                        <p className="text-[10px] text-muted-foreground">USR-7721 • f.yusuf@landregistry.gov</p>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground">Commission Officer</TableCell>
                      <TableCell><Badge variant="destructive" className="text-[10px] border-none">SUSPENDED</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground text-right font-medium">3 days ago</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="shadow-sm border-t-2 border-t-sidebar">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Security Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-md">
                  <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-green-800 uppercase tracking-wider mb-1">Firewall: Optimal</h5>
                    <p className="text-[10px] text-green-700/90 font-medium leading-relaxed">No unauthorized access attempts detected in the last 24h.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Encryption AES-256</span>
                    <Badge variant="outline" className="text-[9px] font-bold text-primary border-primary">ACTIVE</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Database Backups</span>
                    <span className="text-[10px] font-bold text-foreground">6 MIN AGO</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground">Policy Sync</span>
                    <span className="text-[10px] font-bold text-green-600">STABLE</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs font-bold h-9 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors">
                  Run Vulnerability Scan
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Audit Trail</CardTitle>
                <Badge variant="destructive" className="text-[9px] animate-pulse rounded-full px-2 py-0 h-4 uppercase border-none">LIVE</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <div className="p-3 border-b text-xs hover:bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-medium block mb-1">10:42 AM</span>
                    <span className="font-medium">Listing Created by <span className="font-bold text-foreground">Sarah Mensah</span> on Plot 42, Lekki Ph 1</span>
                  </div>
                  <div className="p-3 border-b text-xs hover:bg-muted/30 bg-primary/5">
                    <span className="text-[10px] text-muted-foreground font-medium block mb-1">10:40 AM</span>
                    <span className="font-medium text-primary font-bold flex items-center"><ShieldCheck className="w-3 h-3 mr-1 inline"/> Escrow Auto-Release by System on ESC-44102</span>
                  </div>
                  <div className="p-3 border-b text-xs hover:bg-muted/30">
                    <span className="text-[10px] text-muted-foreground font-medium block mb-1">10:15 AM</span>
                    <span className="font-medium">Verification Approved by <span className="font-bold text-foreground">Chidi Okoro</span> on AGT-9921</span>
                  </div>
                  <div className="p-3 border-b text-xs hover:bg-muted/30 bg-destructive/5">
                    <span className="text-[10px] text-muted-foreground font-medium block mb-1">09:55 AM</span>
                    <span className="font-medium text-destructive flex items-center"><ShieldX className="w-3 h-3 mr-1 inline"/> Document Rejected by Fatima Yusuf on DOC-1502</span>
                  </div>
                  <div className="p-3 border-b text-xs hover:bg-muted/30 bg-amber-50">
                    <span className="text-[10px] text-muted-foreground font-medium block mb-1">08:22 AM</span>
                    <span className="font-medium text-amber-700 flex items-center"><ShieldAlert className="w-3 h-3 mr-1 inline"/> Login Failure by Olamide Adeyemi on IP: 192.168.1.44</span>
                  </div>
                </div>
                <div className="p-3 text-center bg-muted/10 border-t">
                  <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">View Extensive Registry History</a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-sidebar text-white shadow-sm border-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-primary flex items-center justify-center font-bold">AS</div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">Alex Sterling</h4>
                    <p className="text-[9px] text-sidebar-foreground/70 font-bold uppercase tracking-wider">MASTER ADMINISTRATOR</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-sidebar-foreground/70">Security Level:</span>
                    <span className="font-bold">TIER 4</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-sidebar-foreground/70">Active Session:</span>
                    <span className="font-bold">2h 46m</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full h-8 text-xs font-bold bg-white text-sidebar hover:bg-white/90">
                  <Terminal className="w-3.5 h-3.5 mr-2" /> Terminal Access
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Infrastructure Footer */}
        <div className="pt-6 mt-6 border-t">
          <h4 className="font-bold text-sm mb-4">Infrastructure Health</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-card border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Application Core</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-sm font-bold text-foreground">HEALTHY</p>
              <div className="w-full bg-muted h-1 mt-2 rounded-full"><div className="w-[52%] h-full bg-primary rounded-full"></div></div>
            </div>

            <div className="bg-card border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Escrow Engine</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-sm font-bold text-foreground">HEALTHY</p>
              <div className="w-full bg-muted h-1 mt-2 rounded-full"><div className="w-[40%] h-full bg-primary rounded-full"></div></div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Document Vault</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              </div>
              <p className="text-sm font-bold text-amber-700">DEGRADED</p>
              <div className="w-full bg-amber-200 h-1 mt-2 rounded-full"><div className="w-[64%] h-full bg-amber-500 rounded-full"></div></div>
            </div>

            <div className="bg-card border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Identity Service</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-sm font-bold text-foreground">HEALTHY</p>
              <div className="w-full bg-muted h-1 mt-2 rounded-full"><div className="w-[25%] h-full bg-primary rounded-full"></div></div>
            </div>

          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-8 pt-4 pb-2 border-t flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
          <span>LANDEVO INSTITUTIONAL REGISTRY CONTROL • v4.2.1 STABLE</span>
          <span>SERVER NODE: LAG-NG-01</span>
        </div>

      </div>
    </AppLayout>
  );
}
