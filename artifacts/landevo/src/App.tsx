import React, { useEffect } from "react";
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
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

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => {
        const [, navigate] = useLocation();
        useEffect(() => { navigate('/dashboard'); }, []);
        return null;
      }} />
      
      {/* Agent Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={PropertyDetail} />
      <Route path="/listings/create" component={CreateListing} />
      <Route path="/verification" component={Verification} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/messages" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={Admin} />
      
      {/* Buyer Routes */}
      <Route path="/buyer" component={BuyerHome} />
      <Route path="/buyer/browse" component={BuyerBrowse} />
      <Route path="/buyer/property/:id" component={BuyerPropertyDetail} />
      <Route path="/buyer/offers" component={BuyerOffers} />
      <Route path="/buyer/escrow" component={BuyerEscrow} />
      <Route path="/buyer/messages" component={BuyerMessages} />
      <Route path="/buyer/notifications" component={BuyerNotifications} />
      <Route path="/buyer/settings" component={BuyerSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
      <Router />
    </WouterRouter>
  );
}

export default App;
