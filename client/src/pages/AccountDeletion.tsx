import { Mail, ShieldAlert, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const deletionEmail = "service@kingengine.online";

export default function AccountDeletion() {
  const subject = encodeURIComponent("WeParlay account deletion request");
  const body = encodeURIComponent("Please delete my WeParlay account.\n\nAccount email or username:\n\nI understand this request permanently removes my profile and available WeParlay Cash balance after identity verification, except records WeParlay must retain by law.");

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl"><Trash2 className="h-7 w-7 text-primary" />Delete your WeParlay account</CardTitle>
          <CardDescription>Request permanent deletion of your WeParlay account and associated personal data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">How to request deletion</h2>
            <p>Send a deletion request from the email address on your account. Include your username or account email, but never send your password, payment-card number, or identity documents by email.</p>
            <a href={`mailto:${deletionEmail}?subject=${subject}&body=${body}`}><Button><Mail className="mr-2 h-4 w-4" />Request account deletion</Button></a>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">What happens next</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>We verify that the request comes from the account owner.</li>
              <li>We disable account access while the request is processed.</li>
              <li>We delete your profile, social connections, preferences, and stored account data that we no longer need.</li>
              <li>We retain only records required for security, fraud prevention, dispute handling, tax, or other legal obligations.</li>
            </ul>
          </section>
          <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm"><ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" /><p>Account deletion is permanent and cannot be undone. Any unresolved challenge, tournament, support, or legal obligation may delay final deletion until it is resolved.</p></div>
          <p className="text-sm">If you cannot access your account email, contact <a className="text-primary underline" href={`mailto:${deletionEmail}`}>{deletionEmail}</a> and include enough information for us to verify ownership securely.</p>
        </CardContent>
      </Card>
    </main>
  );
}
