import { Route, Switch, Router as WouterRouter } from 'wouter';
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

function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Replit Agent is building...
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your app will appear here once it's ready.
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => {
        window.location.href = '/dashboard';
        return null;
      }} />
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
