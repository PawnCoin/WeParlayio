import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">WeParlay Terms of Service</CardTitle>
          <CardDescription>Last Updated: May 19, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement made between you and WeParlay Inc. ("we," "us," or "our"), concerning your access to and use of the weparlay.io website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>
                <p className="mt-2">
                  You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms. If you do not agree with all of these Terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">2. User Representation</h2>
                <p>
                  By using the Site, you represent and warrant that:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>You are at least 18 years of age and have the legal capacity to enter into these Terms.</li>
                  <li>You will comply with these Terms and all applicable local, state, national, and international laws, rules, and regulations.</li>
                  <li>You have not been previously suspended or removed from the Site.</li>
                  <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                  <li>You are using the Site in a jurisdiction where sports betting is legal.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">3. User Registration</h2>
                <p>
                  You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">4. Prohibited Activities</h2>
                <p>
                  You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
                <p className="mt-2">
                  As a user of the Site, you agree not to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Systematically retrieve data or content from the Site to create a collection, compilation, database, or directory.</li>
                  <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information.</li>
                  <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
                  <li>Engage in unauthorized framing of or linking to the Site.</li>
                  <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                  <li>Engage in any automated use of the system, such as using scripts to send comments or messages.</li>
                  <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">5. User Generated Contributions</h2>
                <p>
                  The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site.
                </p>
                <p className="mt-2">
                  Any content you post to the Site will be considered non-confidential and non-proprietary. By posting any content to the Site, you grant us the right and license to use, modify, reproduce, and distribute such content on our Site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">6. Betting and Financial Transactions</h2>
                <p>
                  WeParlay.io operates as a sports betting platform. When using our betting services, you acknowledge and agree to the following:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>All bets are final once placed and cannot be canceled or modified.</li>
                  <li>We reserve the right to refuse or limit bets at our discretion.</li>
                  <li>Winnings will be credited to your account balance after the event is settled.</li>
                  <li>Any suspected fraudulent activity may result in account suspension and fund holds.</li>
                  <li>Withdrawals are subject to verification procedures and may take time to process.</li>
                  <li>Users are responsible for any taxes applicable to their winnings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">7. Third-Party Websites and Content</h2>
                <p>
                  The Site may contain links to third-party websites and applications and/or may use third-party services to provide certain functionality. Linked websites and applications are not under our control, and we are not responsible for their content, offerings, or availability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">8. Site Management</h2>
                <p>
                  We reserve the right, but not the obligation, to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Monitor the Site for violations of these Terms.</li>
                  <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms.</li>
                  <li>Refuse, restrict access to, limit the availability of, or disable any of your contributions or any portion thereof.</li>
                  <li>Remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems.</li>
                  <li>Otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">9. Term and Termination</h2>
                <p>
                  These Terms shall remain in full force and effect while you use the Site. We may terminate your access to the Site, without cause or notice, which may result in the forfeiture and destruction of all information associated with your account. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">10. Governing Law</h2>
                <p>
                  These Terms and your use of the Site are governed by and construed in accordance with the laws applicable in the jurisdiction where we operate, without regard to its conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will alert you about any changes by updating the "Last Updated" date of these Terms. It is your responsibility to periodically review these Terms to stay informed of updates. Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-2">
                  <p>WeParlay, Inc.</p>
                  <p>Email: support@weparlay.io</p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}