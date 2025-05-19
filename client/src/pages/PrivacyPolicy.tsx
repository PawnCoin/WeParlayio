import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">WeParlay Privacy Policy</CardTitle>
          <CardDescription>Last Updated: May 19, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p>
                  WeParlay ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website weparlay.io, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site").
                </p>
                <p className="mt-2">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">2. Collection of Your Information</h2>
                <p>
                  We may collect information about you in a variety of ways. The information we may collect via the Site includes:
                </p>
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium">Personal Data</h3>
                  <p>
                    Personally identifiable information, such as your name, email address, and profile picture that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site. This includes information you provide when you sign up for an account, subscribe to our service, enter a contest, or use our services via social login providers like Google or Facebook.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Derivative Data</h3>
                  <p>
                    Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Financial Data</h3>
                  <p>
                    Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Social Network Data</h3>
                  <p>
                    Information from social networking sites, such as Google, Facebook, and other third-party social media platforms, if you connect your account to or otherwise grant us access to such information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">3. Use of Your Information</h2>
                <p>
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Create and manage your account.</li>
                  <li>Process transactions and send you related information.</li>
                  <li>Compile anonymous statistical data for research purposes.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Deliver targeted advertising, newsletters, and promotions.</li>
                  <li>Enable user-to-user communications.</li>
                  <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                  <li>Increase the efficiency and operation of the Site.</li>
                  <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                  <li>Notify you of updates to the Site.</li>
                  <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">4. Disclosure of Your Information</h2>
                <p>
                  We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </p>
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium">Third-Party Service Providers</h3>
                  <p>
                    We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Marketing Communications</h3>
                  <p>
                    With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Interactions with Other Users</h3>
                  <p>
                    If you interact with other users of the Site, those users may see your name, profile photo, and descriptions of your activity.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Online Postings</h3>
                  <p>
                    When you post comments, contributions or other content to the Site, your posts may be viewed by all users and may be publicly distributed outside the Site in perpetuity.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-3">Legal Requirements</h3>
                  <p>
                    We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">5. Security of Your Information</h2>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">6. Your Privacy Rights</h2>
                <div className="ml-4 mt-2">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <p>
                    You may at any time review or change the information in your account or terminate your account by:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Logging into your account settings and updating your account.</li>
                    <li>Contacting us using the contact information provided below.</li>
                  </ul>
                  <p className="mt-2">
                    Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with legal requirements.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us at:
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