import { Database, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const contactEmail = "service@kingengine.online";

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl"><Shield className="h-7 w-7 text-primary" />WeParlay Privacy Policy</CardTitle>
          <CardDescription>Effective September 8, 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>This policy explains how WeParlay collects, uses, shares, protects, and deletes information when you use our play-cash sports challenge platform, live sports features, and paid membership tiers.</p>
          <p>WeParlay does not offer real-money wagering, cryptocurrency wagering, deposits, withdrawals, or cash prizes in the current app release. Paid tiers are memberships that unlock eligible platform features; they are not wagers.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Information we collect</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <section><h2 className="font-semibold text-foreground">Account and profile information</h2><p>When you create or use an account, we may collect your username, email address, password hash, profile image, timezone, preferences, social sign-in details you choose to provide, and account activity.</p></section>
          <section><h2 className="font-semibold text-foreground">Challenge, tournament, and support information</h2><p>We process play-cash balances, challenge selections, results, records, invitations, chat messages, reports, support requests, and referral activity so the service can operate and disputes can be handled.</p></section>
          <section><h2 className="font-semibold text-foreground">Device and service information</h2><p>We may receive device, browser, IP-address, log, and security information used to operate the service, prevent abuse, diagnose errors, and protect accounts.</p></section>
          <section><h2 className="font-semibold text-foreground">Membership purchases</h2><p>If you purchase an eligible paid tier, the purchase is handled by the applicable payment platform or processor. We receive purchase status and membership-entitlement information; we do not store full payment-card numbers.</p></section>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>How we use information</CardTitle></CardHeader><CardContent className="text-muted-foreground"><ul className="list-disc space-y-2 pl-5"><li>Provide accounts, play-cash challenges, tournaments, live sports features, and membership entitlements.</li><li>Authenticate users, protect accounts, prevent fraud and abuse, and enforce our rules.</li><li>Respond to support requests, safety reports, and deletion requests.</li><li>Improve reliability, accessibility, and service performance.</li><li>Comply with applicable law and enforce our agreements.</li></ul></CardContent></Card>

      <Card><CardHeader><CardTitle>When we share information</CardTitle></CardHeader><CardContent className="space-y-3 text-muted-foreground"><p>We share information only as needed with service providers that help us host the service, authenticate users, send permitted communications, process membership purchases, provide support, or secure the platform.</p><p>We may disclose information when required by law, to protect users or the public, to enforce our rights, or as part of a corporate transaction. We do not sell personal information for cross-context behavioral advertising.</p></CardContent></Card>

      <Card><CardHeader><CardTitle>Data retention and your choices</CardTitle></CardHeader><CardContent className="space-y-3 text-muted-foreground"><p>We retain information only for as long as reasonably necessary to provide the service, resolve disputes, meet legal obligations, and maintain security records. You can update eligible profile information in the app.</p><p>To request access, correction, or deletion, visit <a className="text-primary underline" href="/account-deletion">Account Deletion</a> or contact us at <a className="text-primary underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>. We may verify account ownership before acting on a request.</p></CardContent></Card>

      <Card><CardHeader><CardTitle>Security, age, and updates</CardTitle></CardHeader><CardContent className="space-y-3 text-muted-foreground"><p>We use reasonable administrative, technical, and organizational safeguards to protect information. No method of transmission or storage is completely secure.</p><p>WeParlay is intended only for people 18 years of age or older. We do not knowingly collect personal information from minors.</p><p>We may update this policy as the service changes. The effective date above will be updated when material changes are published.</p></CardContent></Card>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Contact</CardTitle></CardHeader><CardContent className="text-muted-foreground"><p>For privacy questions or requests, contact <a className="text-primary underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p></CardContent></Card>
    </main>
  );
}
