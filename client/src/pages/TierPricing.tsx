import { Check, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  { name: "Wood", price: "Free", benefits: ["Custom-bet rooms", "Daily games and results", "Standard support"] },
  { name: "Bronze", price: "$9.99", benefits: ["Wood benefits", "Expanded room access", "Tier recognition"] },
  { name: "Silver", price: "$19.99", benefits: ["Bronze benefits", "Eligible live viewing where licensed", "Priority support"] },
  { name: "Gold", price: "$49.99", benefits: ["Silver benefits", "Higher room limits", "Premium recognition"] },
  { name: "Platinum", price: "$99.99", benefits: ["Gold benefits", "Highest available limits", "Top support priority"] },
];

export default function TierPricing() {
  return <div className="container mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8 text-center"><Crown className="mx-auto mb-3 h-10 w-10 text-emerald-500" /><h1 className="text-4xl font-black">Membership tiers</h1><p className="mt-2 text-muted-foreground">Clear access levels for WeParlay features.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{tiers.map(tier => <Card key={tier.name}><CardHeader><CardTitle>{tier.name}</CardTitle><div className="text-2xl font-black text-emerald-500">{tier.price}<span className="text-xs font-normal text-muted-foreground">{tier.price !== "Free" && "/month"}</span></div></CardHeader><CardContent className="space-y-3">{tier.benefits.map(item => <div key={item} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{item}</div>)}</CardContent></Card>)}</div>
    <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">Paid tier checkout is not active until billing terms, refund rules, feature entitlements, and payment processing are finalized. Live viewing also depends on licensed rights and location.</p>
  </div>;
}
