import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return <div className="container mx-auto max-w-4xl px-4 py-10">
    <Card><CardHeader><CardTitle className="text-3xl">About WeParlay</CardTitle></CardHeader><CardContent className="space-y-4 text-muted-foreground">
      <p>WeParlay is a sports-betting challenge platform built around user-to-user custom bets, daily tournaments, live game information, and a single shared bet slip.</p>
      <p>WeParlay Cash is promotional platform value and is not withdrawable cash. Debit-card and cryptocurrency wagering are not active until identity, age, location, licensing, jurisdiction, and payment-provider requirements are completed.</p>
      <p>We verify official event results before settlement and maintain wager, result, refund, and payout records. Live viewing availability depends on the user’s tier, location, and licensed streaming rights.</p>
    </CardContent></Card>
  </div>;
}
