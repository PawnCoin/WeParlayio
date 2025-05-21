import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Lock, Eye, FileText, Clock, CheckCircle2 } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: May 20, 2025
        </p>

        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="full">
              <FileText className="h-4 w-4 mr-2" />
              Full Policy
            </TabsTrigger>
            <TabsTrigger value="updates">
              <Clock className="h-4 w-4 mr-2" />
              Updates
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy Summary</CardTitle>
                <CardDescription>
                  Key points to understand about how we handle your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Information We Collect</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Account information (email, username)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Wallet addresses and transaction details</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Betting history and preferences</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Usage data and analytics</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">How We Protect Your Data</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>End-to-end encryption for all sensitive data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Secure, regulated payment processing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Regular security audits and penetration testing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Compliance with GDPR and applicable regulations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Your Rights</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Access and download your personal data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Request correction or deletion of your data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Opt out of marketing communications</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Lodge a complaint with supervisory authorities</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">How to Contact Us</h3>
                    </div>
                    <p className="text-sm mb-3">
                      If you have any questions about our privacy practices or want to exercise your rights:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Email: privacy@weparlay.io</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Support: support@weparlay.io</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Contact form: weparlay.io/contact</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Policy Tab */}
          <TabsContent value="full">
            <Card>
              <CardHeader>
                <CardTitle>Complete Privacy Policy</CardTitle>
                <CardDescription>
                  Detailed information about how we collect, use, and protect your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Introduction</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Welcome to WeParlay ("we," "our," or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
                      </p>
                      <p className="mb-3">
                        Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy and our Terms of Service.
                      </p>
                      <p>
                        If you do not agree with the terms of this Privacy Policy, please do not access the Service.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Information We Collect</AccordionTrigger>
                    <AccordionContent>
                      <p className="font-medium mb-2">2.1 Personal Data</p>
                      <p className="mb-3">
                        We may collect personally identifiable information, such as:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Email address</li>
                        <li>First and last name</li>
                        <li>Username and password</li>
                        <li>Profile picture</li>
                        <li>Cryptocurrency wallet addresses</li>
                        <li>Transaction data and betting history</li>
                        <li>IP address and device information</li>
                        <li>Information provided when contacting customer support</li>
                      </ul>

                      <p className="font-medium mb-2">2.2 Non-Personal Data</p>
                      <p className="mb-3">
                        We may also collect non-personal information that does not directly identify you, including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Browser type</li>
                        <li>Operating system</li>
                        <li>Access times and pages viewed</li>
                        <li>Referring website addresses</li>
                        <li>Aggregated usage and performance data</li>
                      </ul>

                      <p className="font-medium mb-2">2.3 Blockchain Data</p>
                      <p className="mb-3">
                        When interacting with blockchain networks through our Service, we may collect:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Public wallet addresses</li>
                        <li>Transaction hashes</li>
                        <li>Smart contract interactions</li>
                        <li>Network gas fees and transaction details</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. How We Use Your Information</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        We use the information we collect for various purposes, including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>To provide, maintain, and improve our Service</li>
                        <li>To process transactions and manage your account</li>
                        <li>To verify your identity and prevent fraud</li>
                        <li>To provide customer support and respond to inquiries</li>
                        <li>To send service updates and administrative messages</li>
                        <li>To personalize your experience with relevant content and offers</li>
                        <li>To analyze usage patterns and optimize our Service</li>
                        <li>To comply with legal obligations and enforce our terms</li>
                        <li>To ensure the security of our platform and users</li>
                      </ul>

                      <p className="font-medium mb-2">3.1 Marketing Communications</p>
                      <p className="mb-3">
                        With your consent, we may use your email address to send promotional emails about new features, special offers, or other information we think you may find interesting. You can opt out of these communications at any time by clicking the unsubscribe link in any marketing email or by contacting us directly.
                      </p>

                      <p className="font-medium mb-2">3.2 Analytics and Improvements</p>
                      <p>
                        We use data analytics to better understand how users interact with our Service, identify areas for improvement, enhance user experience, and optimize our offerings. This analysis is performed on aggregated or pseudonymized data whenever possible.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>4. How We Share Your Information</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        We may share your information in the following situations:
                      </p>

                      <p className="font-medium mb-2">4.1 Service Providers</p>
                      <p className="mb-3">
                        We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.
                      </p>

                      <p className="font-medium mb-2">4.2 Business Transfers</p>
                      <p className="mb-3">
                        If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you before your information becomes subject to a different Privacy Policy.
                      </p>

                      <p className="font-medium mb-2">4.3 Legal Requirements</p>
                      <p className="mb-3">
                        We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency) to meet national security or law enforcement requirements.
                      </p>

                      <p className="font-medium mb-2">4.4 With Your Consent</p>
                      <p className="mb-3">
                        We may share your information for other purposes with your explicit consent.
                      </p>

                      <p className="font-medium mb-2">4.5 Blockchain Transactions</p>
                      <p>
                        Please note that cryptocurrency transactions are recorded on public blockchains. While we do not publish your identity in connection with transaction addresses, transaction details including wallet addresses are publicly visible on the applicable blockchain.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>5. Data Security</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        We employ industry-standard security measures to protect your personal information:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>End-to-end encryption for sensitive data transmission</li>
                        <li>Secure storage with encryption at rest</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Strict access controls and authentication procedures</li>
                        <li>Continuous monitoring for suspicious activities</li>
                        <li>Compliance with industry security standards</li>
                      </ul>
                      <p className="mb-3">
                        Despite our best efforts, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we strive to protect your personal information using commercially acceptable means.
                      </p>
                      <p>
                        For cryptocurrency transactions, we recommend using hardware wallets and following best security practices for your private keys and seed phrases, which we never have access to.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>6. Your Rights and Choices</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Depending on your location, you may have certain rights regarding your personal information:
                      </p>

                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
                        <li><strong>Rectification:</strong> You can request correction of inaccurate or incomplete information.</li>
                        <li><strong>Erasure:</strong> You can request deletion of your personal data in certain circumstances.</li>
                        <li><strong>Restriction:</strong> You can request that we limit how we use your data.</li>
                        <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</li>
                        <li><strong>Objection:</strong> You can object to our processing of your data for specific purposes.</li>
                        <li><strong>Automated Decisions:</strong> You can request human intervention for decisions based solely on automated processing.</li>
                      </ul>

                      <p className="mb-3">
                        To exercise these rights, please contact us using the information provided in the "Contact Us" section. We will respond to your request within the timeframe required by applicable law.
                      </p>

                      <p>
                        Please note that some of these rights may be limited where we have compelling legitimate grounds or legal obligations to process your personal information.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>7. Retention of Your Information</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                      </p>
                      <p className="mb-3">
                        When determining appropriate retention periods, we consider:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>The amount, nature, and sensitivity of the personal data</li>
                        <li>The potential risk of harm from unauthorized use or disclosure</li>
                        <li>The purposes for which we process the data</li>
                        <li>Whether we can achieve those purposes through other means</li>
                        <li>Legal, regulatory, and contractual requirements</li>
                      </ul>
                      <p>
                        When we no longer need personal information, we will securely delete or anonymize it. Please note that we may retain certain information as required by law or for legitimate business purposes, such as resolving disputes, preventing fraud, and enforcing our agreements.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>8. International Data Transfers</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Our Service is operated from the United States. If you are located outside of the United States, please be aware that information we collect will be transferred to, processed, and stored in the United States and other countries where our servers and service providers are located.
                      </p>
                      <p className="mb-3">
                        By using our Service or providing us with any information, you consent to this transfer, processing, and storage of your information in countries where the privacy laws may be less comprehensive than those in the country where you reside or are a citizen.
                      </p>
                      <p>
                        Where applicable, we use appropriate safeguards such as standard contractual clauses or rely on adequacy decisions to transfer personal data from the European Economic Area, the United Kingdom, or Switzerland to other countries.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger>9. Children's Privacy</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Our Service is not intended for individuals under the age of 18 (or the applicable minimum age for lawful gambling in your jurisdiction, which may be higher). We do not knowingly collect personally identifiable information from children under 18.
                      </p>
                      <p className="mb-3">
                        If you are a parent or guardian and believe we have collected information from your child, please contact us immediately. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers.
                      </p>
                      <p>
                        We implement age verification procedures as required by applicable gambling regulations and are committed to promoting responsible gambling practices.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>10. Contact Us</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                      </p>
                      <p className="mb-3">
                        <strong>Email:</strong> privacy@weparlay.io
                      </p>
                      <p className="mb-3">
                        <strong>Postal Address:</strong><br />
                        WeParlay Inc.<br />
                        1234 Sports Ave, Suite 500<br />
                        Las Vegas, NV 89109<br />
                        United States
                      </p>
                      <p>
                        If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, please contact our third-party dispute resolution provider (free of charge) at https://feedback-form.truste.com/watchdog/request.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Policy Updates</CardTitle>
                <CardDescription>
                  History of changes to our Privacy Policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">May 20, 2025 - Current Version</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Enhanced cryptocurrency wallet security section</li>
                      <li>Updated data retention policies</li>
                      <li>Added clarity around blockchain transaction privacy</li>
                      <li>Improved language around user rights and choices</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">January 15, 2025</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Added multi-currency support statements</li>
                      <li>Updated international data transfer information</li>
                      <li>Clarified third-party service provider relationships</li>
                      <li>Enhanced section on blockchain data collection</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">October 10, 2024</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Initial privacy policy published</li>
                      <li>Established basic data handling practices</li>
                      <li>Outlined user rights and company obligations</li>
                      <li>Defined terms for sports betting platform</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">How We Notify You of Changes</h3>
                  <p className="text-sm mb-3">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:
                  </p>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Posting the updated policy on our website with a new effective date</li>
                    <li>Sending an email to the address associated with your account</li>
                    <li>Displaying a prominent notice within our application</li>
                    <li>Requiring acknowledgment of the updated policy when you next log in</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrivacyPolicy;