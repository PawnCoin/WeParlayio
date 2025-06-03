import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Diamond, Star, Zap, ArrowLeft, Loader2 } from "lucide-react";

const tierPlans = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: '$9.99',
    period: 'month',
    icon: Star,
    color: 'from-orange-400 to-orange-600',
    features: [
      'Basic betting functionality',
      'Standard odds access',
      'Email support',
      'Basic analytics',
      'Mobile app access'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '$19.99',
    period: 'month',
    icon: Zap,
    color: 'from-gray-400 to-gray-600',
    popular: true,
    features: [
      'Everything in Bronze',
      'Live streaming access',
      'Advanced analytics',
      'Priority support',
      'Multi-currency betting',
      'Parlay betting'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$39.99',
    period: 'month',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    features: [
      'Everything in Silver',
      'Exclusive tournaments',
      'VIP chat support',
      'Advanced betting tools',
      'Custom alerts',
      'API access'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '$79.99',
    period: 'month',
    icon: Crown,
    color: 'from-purple-400 to-purple-600',
    features: [
      'Everything in Gold',
      'Personal account manager',
      'Custom betting limits',
      'Premium insights',
      'White-label options',
      'Early feature access'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: '$149.99',
    period: 'month',
    icon: Diamond,
    color: 'from-blue-400 to-blue-600',
    elite: true,
    features: [
      'Everything in Platinum',
      'White-glove service',
      'Unlimited access',
      'Beta features',
      'Platform settings access',
      'System management tools'
    ]
  }
];

export default function UpgradeTier() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest('POST', '/api/stripe/create-tier-subscription', { tierId });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Upgrade Initiated",
        description: `Starting upgrade to ${data.tierName} tier. Redirecting to payment...`,
      });
      
      // Redirect to Stripe Checkout or handle payment flow
      window.location.href = `/payment-checkout?subscription=${data.subscriptionId}&client_secret=${data.clientSecret}`;
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to initiate tier upgrade. Please try again.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    },
  });

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    upgradeMutation.mutate(planId);
  };

  const handleGoBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Upgrade Your WeParlay Experience</h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the perfect plan to unlock advanced features and take your betting to the next level
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {tierPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-orange-500 shadow-lg' : ''
                } ${
                  plan.elite ? 'ring-2 ring-blue-500 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                {plan.elite && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Elite Access</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full"
                    variant={plan.popular || plan.elite ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Why Upgrade?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Enhanced Features</h4>
                  <p className="text-gray-600">Access advanced betting tools and exclusive content</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Priority Support</h4>
                  <p className="text-gray-600">Get faster response times and dedicated assistance</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Exclusive Access</h4>
                  <p className="text-gray-600">Early access to new features and beta testing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All plans include a 30-day money-back guarantee. Cancel anytime.</p>
          <p className="mt-2">Questions? Contact our support team at support@weparlay.io</p>
        </div>
      </div>
    </div>
  );
}