import React, { useEffect } from "react";
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import Marketplace from '@/pages/marketplace';
import PropertyDetail from '@/pages/marketplace-detail';
import CreateListing from '@/pages/create-listing';
import Verification from '@/pages/verification';
import Transactions from '@/pages/transactions';
import Messages from '@/pages/messages';
import Notifications from '@/pages/notifications';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';
import CommissionSettings from '@/pages/commission/settings';

// Admin Pages
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminEscrow from '@/pages/admin/escrow';
import AdminUsers from '@/pages/admin/users';
import AdminTransactions from '@/pages/admin/transactions';
import AdminActivity from '@/pages/admin/activity';

// Buyer Pages
import BuyerHome from '@/pages/buyer/home';
import BuyerBrowse from '@/pages/buyer/browse';
import BuyerPropertyDetail from '@/pages/buyer/property-detail';
import BuyerOffers from '@/pages/buyer/offers';
import BuyerEscrow from '@/pages/buyer/escrow';
import BuyerMessages from '@/pages/buyer/messages';
import BuyerNotifications from '@/pages/buyer/notifications';
import BuyerSettings from '@/pages/buyer/settings';

// Commission Pages
import CommissionDashboard from '@/pages/commission/dashboard';
import CommissionVerifications from '@/pages/commission/verifications';
import CommissionListings from '@/pages/commission/listings';
import CommissionAudit from '@/pages/commission/audit';
import CommissionOfficers from '@/pages/commission/officers';

import { AuthProvider, useAuth } from '@/hooks/use-auth';

function LoadingScreen() {
  return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
}

/** Agent-only routes */
function AgentRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role === 'buyer') return <Redirect to="/buyer" />;
  if (user.role === 'commission_admin') return <Redirect to="/commission" />;
  return <Component />;
}

/** Buyer-only routes */
function BuyerRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'buyer') return <Redirect to="/dashboard" />;
  return <Component />;
}

/** Commission-admin-only routes */
function CommissionRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'commission_admin') return <Redirect to="/dashboard" />;
  return <Component />;
}

/** System-admin-only routes */
function SystemAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/admin/login" />;
  if (user.role !== 'system_admin') return <Redirect to="/admin/login" />;
  return <Component />;
}

/** Root redirect: send to the right home based on role */
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role === 'buyer') return <Redirect to="/buyer" />;
  if (user.role === 'commission_admin') return <Redirect to="/commission" />;
  if (user.role === 'system_admin') return <Redirect to="/admin" />;
  return <Redirect to="/dashboard" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={RootRedirect} />

      {/* Agent Routes */}
      <Route path="/dashboard"         component={() => <AgentRoute component={Dashboard} />} />
      <Route path="/marketplace"       component={() => <AgentRoute component={Marketplace} />} />
      <Route path="/marketplace/:id"   component={() => <AgentRoute component={PropertyDetail} />} />
      <Route path="/listings/create"   component={() => <AgentRoute component={CreateListing} />} />
      <Route path="/verification"      component={() => <AgentRoute component={Verification} />} />
      <Route path="/transactions"      component={() => <AgentRoute component={Transactions} />} />
      <Route path="/messages"          component={() => <AgentRoute component={Messages} />} />
      <Route path="/notifications"     component={() => <AgentRoute component={Notifications} />} />
      <Route path="/settings"          component={() => <AgentRoute component={Settings} />} />

      {/* Buyer Routes */}
      <Route path="/buyer"                   component={() => <BuyerRoute component={BuyerHome} />} />
      <Route path="/buyer/browse"            component={() => <BuyerRoute component={BuyerBrowse} />} />
      <Route path="/buyer/property/:id"      component={() => <BuyerRoute component={BuyerPropertyDetail} />} />
      <Route path="/buyer/offers"            component={() => <BuyerRoute component={BuyerOffers} />} />
      <Route path="/buyer/escrow"            component={() => <BuyerRoute component={BuyerEscrow} />} />
      <Route path="/buyer/messages"          component={() => <BuyerRoute component={BuyerMessages} />} />
      <Route path="/buyer/notifications"     component={() => <BuyerRoute component={BuyerNotifications} />} />
      <Route path="/buyer/settings"          component={() => <BuyerRoute component={BuyerSettings} />} />

      {/* Land Commission Routes */}
      <Route path="/commission"               component={() => <CommissionRoute component={CommissionDashboard} />} />
      <Route path="/commission/verifications" component={() => <CommissionRoute component={CommissionVerifications} />} />
      <Route path="/commission/listings"      component={() => <CommissionRoute component={CommissionListings} />} />
      <Route path="/commission/audit"         component={() => <CommissionRoute component={CommissionAudit} />} />
      <Route path="/commission/officers"      component={() => <CommissionRoute component={CommissionOfficers} />} />
      <Route path="/commission/settings"      component={() => <CommissionRoute component={CommissionSettings} />} />

      {/* System Admin Routes */}
      <Route path="/admin/login"        component={AdminLogin} />
      <Route path="/admin"              component={() => <SystemAdminRoute component={AdminDashboard} />} />
      <Route path="/admin/escrow"       component={() => <SystemAdminRoute component={AdminEscrow} />} />
      <Route path="/admin/users"        component={() => <SystemAdminRoute component={AdminUsers} />} />
      <Route path="/admin/transactions" component={() => <SystemAdminRoute component={AdminTransactions} />} />
      <Route path="/admin/activity"     component={() => <SystemAdminRoute component={AdminActivity} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
        <Router />
      </WouterRouter>
    </AuthProvider>
  );
}

export default App;
