import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import TryOnsPage from "@/pages/TryOnsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import PluginDemoPage from "@/pages/PluginDemoPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import PricingPage from "@/pages/PricingPage";
import ContactPage from "@/pages/ContactPage";
import EcommerceDemoPage from "@/pages/EcommerceDemoPage";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: () => JSX.Element }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <div className="flex-1">
        <Component />
      </div>
      <MarketingFooter />
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public Marketing Pages */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <PublicRoute component={HomePage} />}
      </Route>
      <Route path="/about">
        <PublicRoute component={AboutPage} />
      </Route>
      <Route path="/pricing">
        <PublicRoute component={PricingPage} />
      </Route>
      <Route path="/contact">
        <PublicRoute component={ContactPage} />
      </Route>
      <Route path="/ecommerce-demo">
        <EcommerceDemoPage />
      </Route>
      
      {/* Auth Pages */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <LoginPage />}
      </Route>
      <Route path="/signup">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <SignupPage />}
      </Route>
      
      {/* Dashboard Pages */}
      <Route path="/dashboard">
        <ProtectedRoute component={TryOnsPage} />
      </Route>
      <Route path="/integrations">
        <ProtectedRoute component={IntegrationsPage} />
      </Route>
      <Route path="/plugin-demo">
        <ProtectedRoute component={PluginDemoPage} />
      </Route>
      <Route path="/subscription">
        <ProtectedRoute component={SubscriptionPage} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
