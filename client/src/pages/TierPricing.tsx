import { useEffect, useRef, useState } from "react";
import { Check, Crown, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const tiers = [
  { name: "Wood", price: "Free", benefits: ["Custom-bet rooms", "Daily games and results", "Standard support"] },
  { name: "Bronze", price: "$9.99", benefits: ["Wood benefits", "Expanded room access", "Tier recognition"] },
  { name: "Silver", price: "$19.99", benefits: ["Bronze benefits", "Eligible live viewing where licensed", "Priority support"] },
  { name: "Gold", price: "$49.99", benefits: ["Silver benefits", "Higher room limits", "Premium recognition"] },
  { name: "Platinum", price: "$99.99", benefits: ["Gold benefits", "Highest available limits", "Top support priority"] },
];

export default function TierPricing() {
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{ sessionId: string; planId: string } | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  // The web build does not bundle the Android runtime. Capacitor exposes this
  // bridge only inside the native wrapper, so detect it without importing an
  // Android-only package into the public site bundle.
  const nativeApp = typeof window !== "undefined" && Boolean((window as typeof window & {
    Capacitor?: { isNativePlatform?: () => boolean }
  }).Capacitor?.isNativePlatform?.());

  useEffect(() => {
    if (!checkout || !checkoutRef.current) return;
    const loader = document.createElement('script');
    loader.src = 'https://js.whop.com/static/checkout/loader.js';
    loader.async = true;
    loader.defer = true;
    checkoutRef.current.replaceChildren();
    checkoutRef.current.dataset.whopCheckoutPlanId = checkout.planId;
    checkoutRef.current.dataset.whopCheckoutSession = checkout.sessionId;
    checkoutRef.current.dataset.whopCheckoutReturnUrl = `${window.location.origin}/tiers?checkout=complete`;
    document.body.appendChild(loader);
    return () => loader.remove();
  }, [checkout]);

  const startCheckout = async (tier: string) => {
    if (nativeApp) {
      toast({ title: 'Membership checkout unavailable in this app', description: 'Purchases are not enabled in the Android release yet.' });
      return;
    }
    setLoadingTier(tier);
    try {
      const response = await apiRequest('POST', '/api/whop/tier-checkout', { tier }) as any;
      if (!response?.success || !response.checkout?.sessionId || !response.checkout?.planId) throw new Error(response?.message || 'Checkout is unavailable.');
      setCheckout({ sessionId: response.checkout.sessionId, planId: response.checkout.planId });
    } catch (error: any) {
      toast({ title: 'Checkout unavailable', description: error.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setLoadingTier(null);
    }
  };

  return <div className="container mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8 text-center"><Crown className="mx-auto mb-3 h-10 w-10 text-emerald-500" /><h1 className="text-4xl font-black">Membership tiers</h1><p className="mt-2 text-muted-foreground">Clear access levels for WeParlay features.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{tiers.map(tier => <Card key={tier.name}><CardHeader><CardTitle>{tier.name}</CardTitle><div className="text-2xl font-black text-emerald-500">{tier.price}<span className="text-xs font-normal text-muted-foreground">{tier.price !== "Free" && "/month"}</span></div></CardHeader><CardContent className="space-y-3">{tier.benefits.map(item => <div key={item} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{item}</div>)}{tier.price !== 'Free' && <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" disabled={loadingTier !== null} onClick={() => startCheckout(tier.name.toLowerCase())}>{loadingTier === tier.name.toLowerCase() ? 'Opening checkout…' : <><ExternalLink className="mr-2 h-4 w-4" />Choose {tier.name}</>}</Button>}</CardContent></Card>)}</div>
    {checkout && <Card className="mx-auto mt-6 max-w-2xl border-emerald-500/40"><CardHeader><CardTitle>Complete secure membership checkout</CardTitle></CardHeader><CardContent><div ref={checkoutRef} /></CardContent></Card>}
    <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">Membership payments are separate from play-cash challenges. A tier is applied only after a verified payment confirmation. Live viewing also depends on licensed rights and location.</p>
  </div>;
}
