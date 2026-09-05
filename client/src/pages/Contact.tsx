import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return <div className="container mx-auto max-w-3xl px-4 py-10">
    <Card><CardHeader><CardTitle className="text-3xl">Contact WeParlay</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-muted-foreground">For account help, bet-result questions, payment concerns, accessibility requests, or error reports, open a support request. Include the game, challenge or tournament ID when available, but never send a password or full payment-card number.</p>
      <div className="flex flex-wrap gap-3"><Link href="/support"><Button>Open support</Button></Link><a href="mailto:support@weparlay.io"><Button variant="outline">support@weparlay.io</Button></a></div>
      <p className="text-sm text-muted-foreground">Security concerns can be reported to security@weparlay.io.</p>
    </CardContent></Card>
  </div>;
}
