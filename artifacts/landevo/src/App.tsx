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
import Admin from '@/pages/admin';
import NotFound from '@/pages/not-found';

// Buyer Pages
import BuyerHome from '@/pages/buyer/home';
import BuyerBrowse from '@/pages/buyer/browse';
import BuyerPropertyDetail from '@/pages/buyer/property-detail';
import BuyerOffers from '@/pages/buyer/offers';
import BuyerEscrow from '@/pages/buyer/escrow';
import BuyerMessages from '@/pages/buyer/messages';
import BuyerNotifications from '@/pages/buyer/notifications';
import BuyerSettings from '@/pages/buyer/settings';

import { AuthProvider, useAuth } from '@/hooks/use-auth';

/** Redirects to /login if not authenticated. For agents/commission only. */
function AgentRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Redirect to="/login" />;
  if (user.role === 'buyer') return <Redirect to="/buyer" />;
  return <Component />;
}

/** Redirects to /login if not authenticated. For buyers only. */
function BuyerRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'buyer') return <Redirect to="/dashboard" />;
  return <Component />;
}

/** Root redirect: send to the right home based on role. */
function RootRedirect() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/login');
    else if (user.role === 'buyer') navigate('/buyer');
    else navigate('/dashboard');
  }, [loading, user]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={RootRedirect} />

      {/* Agent / Commission Routes */}
      <Route path="/dashboard" component={() => <AgentRoute component={Dashboard} />} />
      <Route path="/marketplace" component={() => <AgentRoute component={Marketplace} />} />
      <Route path="/marketplace/:id" component={() => <AgentRoute component={PropertyDetail} />} />
      <Route path="/listings/create" component={() => <AgentRoute component={CreateListing} />} />
      <Route path="/verification" component={() => <AgentRoute component={Verification} />} />
      <Route path="/transactions" component={() => <AgentRoute component={Transactions} />} />
      <Route path="/messages" component={() => <AgentRoute component={Messages} />} />
      <Route path="/notifications" component={() => <AgentRoute component={Notifications} />} />
      <Route path="/settings" component={() => <AgentRoute component={Settings} />} />
      <Route path="/admin" component={() => <AgentRoute component={Admin} />} />

      {/* Buyer Routes */}
      <Route path="/buyer" component={() => <BuyerRoute component={BuyerHome} />} />
      <Route path="/buyer/browse" component={() => <BuyerRoute component={BuyerBrowse} />} />
      <Route path="/buyer/property/:id" component={() => <BuyerRoute component={BuyerPropertyDetail} />} />
      <Route path="/buyer/offers" component={() => <BuyerRoute component={BuyerOffers} />} />
      <Route path="/buyer/escrow" component={() => <BuyerRoute component={BuyerEscrow} />} />
      <Route path="/buyer/messages" component={() => <BuyerRoute component={BuyerMessages} />} />
      <Route path="/buyer/notifications" component={() => <BuyerRoute component={BuyerNotifications} />} />
      <Route path="/buyer/settings" component={() => <BuyerRoute component={BuyerSettings} />} />

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
