import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from './DashboardLayout';

type SubscriptionPlan = {
  subId: number;
  subCode: string;
  subName: string;
  subDesc: string | null;
  durationDays: number;
  createdAt: Date;
  pricing: {
    pricingId: number;
    basePrice: string;
    discountPercent: string | null;
    finalPrice: string | null;
    currency: string | null;
  } | null;
};

type UserSubscription = {
  userSubId: number;
  userId: string;
  subId: number;
  pricingId: number | null;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'renewed';
  renewalToken: string | null;
  createdAt: Date;
};

type ActiveSubscription = UserSubscription & {
  plan: Omit<SubscriptionPlan, 'pricing'>;
  pricing: SubscriptionPlan['pricing'];
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscriptions/plans"],
  });

  const { data: currentSubscription } = useQuery<ActiveSubscription | null>({
    queryKey: ["/api/subscriptions/current"],
    enabled: !!user,
  });

  const { data: history = [] } = useQuery<UserSubscription[]>({
    queryKey: ["/api/subscriptions/history"],
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: { subId: number; pricingId: number }) =>
      apiRequest("POST", "/api/subscriptions/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/history"] });
      toast({
        title: "Success!",
        description: "Your subscription has been activated",
      });
      setShowUpgradeDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (data: { newSubId: number; newPricingId: number }) =>
      apiRequest("POST", "/api/subscriptions/upgrade", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/history"] });
      toast({
        title: "Subscription Upgraded!",
        description: `Prorated price: $${data.proratedPrice.toFixed(2)}`,
      });
      setShowUpgradeDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscriptions/cancel", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/history"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const handleConfirmSubscription = () => {
    if (!selectedPlan || !selectedPlan.pricing) return;

    if (currentSubscription) {
      upgradeMutation.mutate({
        newSubId: selectedPlan.subId,
        newPricingId: selectedPlan.pricing.pricingId,
      });
    } else {
      subscribeMutation.mutate({
        subId: selectedPlan.subId,
        pricingId: selectedPlan.pricing.pricingId,
      });
    }
  };

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'BASIC':
        return <Sparkles className="h-6 w-6" />;
      case 'PRO':
        return <TrendingUp className="h-6 w-6" />;
      case 'VENDOR_PREMIUM':
        return <Crown className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your GlamAR subscription and billing
          </p>
        </div>

        {currentSubscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(currentSubscription.plan.subCode)}
                Current Subscription
              </CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentSubscription.plan.subName}</h3>
                  <p className="text-muted-foreground">{currentSubscription.plan.subDesc}</p>
                </div>
                <Badge variant="default" data-testid="badge-subscription-status">
                  {currentSubscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Renewal Date</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-renewal-date">
                      {formatDate(currentSubscription.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Days Remaining</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-days-remaining">
                      {getDaysRemaining(currentSubscription.endDate)} days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-subscription-price">
                      ${currentSubscription.pricing?.finalPrice || '0.00'}/{currentSubscription.plan.durationDays} days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                data-testid="button-cancel-subscription"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </CardFooter>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.subId}
                className={currentSubscription?.subId === plan.subId ? "border-primary" : ""}
                data-testid={`card-plan-${plan.subCode.toLowerCase()}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {getPlanIcon(plan.subCode)}
                    {currentSubscription?.subId === plan.subId && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{plan.subName}</CardTitle>
                  <CardDescription>{plan.subDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ${plan.pricing?.finalPrice || '0'}
                    </span>
                    <span className="text-muted-foreground">/{plan.durationDays} days</span>
                  </div>

                  {plan.pricing?.discountPercent && parseFloat(plan.pricing.discountPercent) > 0 && (
                    <div className="mb-4">
                      <Badge variant="secondary">
                        {plan.pricing.discountPercent}% OFF
                      </Badge>
                      <p className="text-sm text-muted-foreground line-through mt-1">
                        ${plan.pricing.basePrice}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mt-6">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Virtual try-on technology</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">
                        {plan.subCode === 'BASIC' && 'Basic features'}
                        {plan.subCode === 'PRO' && 'Unlimited try-ons'}
                        {plan.subCode === 'VENDOR_PREMIUM' && 'Enterprise API access'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">
                        {plan.subCode === 'BASIC' && '100 credits/month'}
                        {plan.subCode === 'PRO' && '1000 credits/month'}
                        {plan.subCode === 'VENDOR_PREMIUM' && 'Custom credit limits'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentSubscription?.subId === plan.subId || !plan.pricing}
                    data-testid={`button-select-${plan.subCode.toLowerCase()}`}
                  >
                    {currentSubscription?.subId === plan.subId ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your past subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((sub) => {
                  const plan = plans.find(p => p.subId === sub.subId);
                  return (
                    <div
                      key={sub.userSubId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`row-history-${sub.userSubId}`}
                    >
                      <div>
                        <p className="font-medium">{plan?.subName || 'Unknown Plan'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                        </p>
                      </div>
                      <Badge
                        variant={sub.status === 'active' ? 'default' : 'secondary'}
                        data-testid={`badge-history-status-${sub.userSubId}`}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent data-testid="dialog-confirm-subscription">
            <DialogHeader>
              <DialogTitle>
                {currentSubscription ? "Upgrade Subscription" : "Confirm Subscription"}
              </DialogTitle>
              <DialogDescription>
                {currentSubscription
                  ? "You're about to upgrade your subscription. Any unused time will be credited towards your new plan."
                  : "You're about to subscribe to a new plan."}
              </DialogDescription>
            </DialogHeader>

            {selectedPlan && (
              <div className="py-4">
                <h3 className="font-semibold text-lg">{selectedPlan.subName}</h3>
                <p className="text-muted-foreground mb-4">{selectedPlan.subDesc}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ${selectedPlan.pricing?.finalPrice || '0'}
                  </span>
                  <span className="text-muted-foreground">
                    /{selectedPlan.durationDays} days
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
                data-testid="button-cancel-dialog"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubscription}
                disabled={subscribeMutation.isPending || upgradeMutation.isPending}
                data-testid="button-confirm-dialog"
              >
                {subscribeMutation.isPending || upgradeMutation.isPending
                  ? "Processing..."
                  : currentSubscription
                  ? "Upgrade Now"
                  : "Subscribe Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
