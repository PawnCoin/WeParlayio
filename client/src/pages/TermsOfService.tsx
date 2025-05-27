import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, FileText, ShieldAlert, Wallet, PercentIcon, Gavel, Clock } from "lucide-react";

// Hand shake icon component
const HandShake = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
    <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l2.26-2.21a2.13 2.13 0 0 1 3 0h0a2.13 2.13 0 0 1 0 3L13 16.5"></path>
    <path d="m15 16 2-3"></path>
    <path d="m8 9 3-2"></path>
  </svg>
);

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: May 20, 2025
        </p>

        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Gavel className="h-4 w-4 mr-2" />
              Terms
            </TabsTrigger>
            <TabsTrigger value="betting">
              <HandShake className="h-4 w-4 mr-2" />
              Betting Rules
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Wallet className="h-4 w-4 mr-2" />
              Crypto Terms
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service Summary</CardTitle>
                <CardDescription>
                  Key points to understand about using WeParlay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <HandShake className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Service Agreement</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>You must be 18+ (or legal age in your jurisdiction)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Creating an account requires accurate information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>You're responsible for maintaining account security</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Accounts are for individual use only (no sharing)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Gavel className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Legal Compliance</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>You must comply with all applicable laws</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Sports betting may be restricted in your location</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Tax obligations on winnings are your responsibility</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>We comply with anti-money laundering regulations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Cryptocurrency Terms</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>You must own and control your cryptocurrency wallets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Blockchain transaction fees are your responsibility</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Cryptocurrency values are subject to market volatility</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Transactions cannot be reversed once confirmed</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <PercentIcon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Fees & Payouts</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Platform fees apply to certain transactions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Minimum and maximum betting limits apply</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Withdrawals may be subject to verification</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 rounded-full h-1.5 w-1.5 mt-2 mr-2 flex-shrink-0"></span>
                        <span>Disputes must be raised within 14 days</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg text-amber-800 dark:text-amber-300">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Important Notice</h3>
                      <p className="text-sm">
                        This is just a summary. Please read the full Terms of Service for complete details. By using WeParlay, you agree to be bound by the complete terms.
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="mr-2" asChild>
                          <Link href="/privacy-policy">Privacy Policy</Link>
                        </Button>
                        <Button size="sm">
                          Full Terms of Service
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Terms Tab */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Legal Terms & Conditions</CardTitle>
                <CardDescription>
                  The complete legal agreement governing your use of WeParlay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Introduction & Acceptance</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Welcome to WeParlay. These Terms of Service ("Terms") constitute a legally binding agreement between you and WeParlay Inc. ("WeParlay," "we," "our," or "us") governing your access to and use of the WeParlay website, mobile application, and services (collectively, the "Service").
                      </p>
                      <p className="mb-3">
                        By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.
                      </p>
                      <p className="mb-3">
                        We may modify these Terms at any time. We will notify you of material changes by posting the amended Terms on the Service with a new effective date. Your continued use of the Service after any changes indicates your acceptance of the amended Terms.
                      </p>
                      <p>
                        You must be at least 18 years old (or the legal age for gambling in your jurisdiction, whichever is higher) to use our Service. By using the Service, you represent and warrant that you meet this requirement.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Account Registration & Security</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        To access certain features of the Service, you must create an account. When registering for an account, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                      </p>
                      <p className="mb-3">
                        You agree to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Create only one account for personal use</li>
                        <li>Not share your account with any third party</li>
                        <li>Maintain accurate and up-to-date account information</li>
                        <li>Immediately notify us of any unauthorized use of your account</li>
                        <li>Log out of your account at the end of each session</li>
                        <li>Use strong, unique passwords and enable two-factor authentication when available</li>
                      </ul>
                      <p className="mb-3">
                        We reserve the right to suspend or terminate your account if any information provided is inaccurate, outdated, or incomplete, or if we have reason to believe you have violated these Terms.
                      </p>
                      <p>
                        You acknowledge that you are fully responsible for all activities that occur through your account, and you agree to indemnify and hold harmless WeParlay for any loss or damage arising from unauthorized use of your account.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. Prohibited Activities</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        You agree not to engage in any of the following prohibited activities:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Violating any applicable law, regulation, or third-party rights</li>
                        <li>Using the Service from a jurisdiction where sports betting is illegal</li>
                        <li>Using VPNs or other methods to disguise your location</li>
                        <li>Engaging in fraudulent, deceptive, or manipulative activities</li>
                        <li>Attempting to manipulate betting outcomes or odds</li>
                        <li>Using automated systems, bots, scripts, or software to access the Service</li>
                        <li>Attempting to gain unauthorized access to other users' accounts</li>
                        <li>Reverse engineering or attempting to extract the source code of our software</li>
                        <li>Interfering with or disrupting the operation of the Service</li>
                        <li>Uploading viruses or other malicious code</li>
                        <li>Collecting or harvesting user data without consent</li>
                        <li>Using the Service for money laundering or other illegal financial activities</li>
                      </ul>
                      <p>
                        WeParlay reserves the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates these prohibitions, including suspending or terminating accounts, withholding funds, and reporting violations to law enforcement authorities.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>4. Intellectual Property Rights</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        The Service and its original content, features, and functionality are owned by WeParlay and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                      </p>
                      <p className="mb-3">
                        Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Service for your personal, non-commercial use.
                      </p>
                      <p className="mb-3">
                        You may not:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any materials from the Service without our prior written consent</li>
                        <li>Delete or alter any copyright, trademark, or other proprietary notices from any materials obtained from the Service</li>
                        <li>Use any of our trademarks, logos, or other proprietary information without express written permission</li>
                        <li>Attempt to gain unauthorized access to any portion of the Service or its related systems or networks</li>
                      </ul>
                      <p>
                        Any use of the Service not expressly permitted by these Terms is a breach of these Terms and may violate copyright, trademark, and other laws.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>5. User Conduct & Responsible Gambling</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay is committed to promoting responsible gambling. By using our Service, you agree to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Gamble responsibly and within your financial means</li>
                        <li>Not use gambling as a source of income or to recover financial losses</li>
                        <li>Set personal limits on time and money spent</li>
                        <li>Not gamble while under the influence of alcohol or drugs</li>
                        <li>Take regular breaks from gambling activities</li>
                      </ul>
                      <p className="mb-3">
                        We provide tools to help you maintain control, including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Deposit limits</li>
                        <li>Betting limits</li>
                        <li>Time-out periods</li>
                        <li>Self-exclusion options</li>
                        <li>Activity statements</li>
                      </ul>
                      <p className="mb-3">
                        If you believe you may have a gambling problem, we encourage you to seek help from professional organizations such as:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>National Council on Problem Gambling</li>
                        <li>Gamblers Anonymous</li>
                        <li>GamCare</li>
                        <li>BeGambleAware</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>6. Disclaimers & Limitation of Liability</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3 font-medium">6.1 Disclaimer of Warranties</p>
                      <p className="mb-3">
                        THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WEPARLAY EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
                      </p>
                      <p className="mb-3">
                        WEPARLAY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOU USE THE SERVICE AT YOUR OWN RISK.
                      </p>
                      
                      <p className="mb-3 font-medium">6.2 Limitation of Liability</p>
                      <p className="mb-3">
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WEPARLAY, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THE SERVICE.
                      </p>
                      <p className="mb-3">
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WEPARLAY ASSUMES NO LIABILITY OR RESPONSIBILITY FOR:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Any errors, mistakes, or inaccuracies in content</li>
                        <li>Personal injury or property damage resulting from your access to or use of the Service</li>
                        <li>Unauthorized access to or use of our servers or of personal information</li>
                        <li>Interruption or cessation of transmission to or from the Service</li>
                        <li>Bugs, viruses, or other harmful code that may be transmitted through the Service</li>
                        <li>Any loss or damage of any kind incurred as a result of your use of the Service</li>
                      </ul>
                      <p>
                        IN NO EVENT SHALL WEPARLAY'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, TO WEPARLAY FOR ACCESS TO AND USE OF THE SERVICE DURING THE TWELVE (12) MONTH PERIOD PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>7. Indemnification</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        You agree to indemnify, defend, and hold harmless WeParlay, its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that arise from or relate to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Your use of the Service</li>
                        <li>Any violation of these Terms</li>
                        <li>Any violation of any rights of another party</li>
                        <li>Any violation of applicable laws, rules, or regulations</li>
                        <li>Your user content or submissions</li>
                        <li>Any activity related to your account (including negligent or wrongful conduct)</li>
                      </ul>
                      <p>
                        We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>8. Governing Law & Dispute Resolution</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        These Terms shall be governed by and construed in accordance with the laws of the State of Nevada, United States, without regard to its conflict of law provisions.
                      </p>
                      <p className="mb-3">
                        Any dispute arising out of or relating to these Terms or the Service shall be resolved as follows:
                      </p>
                      <ol className="list-decimal pl-6 mb-4 space-y-2">
                        <li>
                          <strong>Informal Resolution:</strong> We encourage you to contact us first to try to resolve any dispute informally by emailing legal@weparlay.io.
                        </li>
                        <li>
                          <strong>Mandatory Arbitration:</strong> If we cannot resolve the dispute informally, any controversy or claim arising out of or relating to these Terms or the Service shall be settled by binding arbitration in accordance with the commercial arbitration rules of the American Arbitration Association. The arbitration shall be conducted in Las Vegas, Nevada, and judgment on the arbitration award may be entered into any court of competent jurisdiction.
                        </li>
                        <li>
                          <strong>Class Action Waiver:</strong> Any arbitration shall be conducted on an individual basis and not as a class action or other form of representative action. Neither you nor WeParlay may act as a class representative or participate as a member of a class of claimants.
                        </li>
                        <li>
                          <strong>Exceptions:</strong> Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights pending the completion of arbitration.
                        </li>
                      </ol>
                      <p className="mb-3">
                        To the extent permitted by law, you agree that any claim or cause of action arising out of or related to the Service or these Terms must be filed within one (1) year after such claim or cause of action arose, or be forever barred.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger>9. Termination</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay reserves the right, in its sole discretion, to terminate or suspend your account and your access to the Service, in whole or in part, immediately and without prior notice or liability, for any reason, including but not limited to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Violation of these Terms</li>
                        <li>Engagement in fraudulent or illegal activities</li>
                        <li>Suspected use of VPNs or other location-masking technologies</li>
                        <li>Suspected use of automated betting systems or bots</li>
                        <li>Creation of multiple accounts</li>
                        <li>Providing false or misleading information</li>
                        <li>Attempts to manipulate betting markets or outcomes</li>
                        <li>Engagement in collusion or match-fixing</li>
                        <li>Suspected problem gambling behavior</li>
                        <li>Any activity deemed harmful to WeParlay or other users</li>
                      </ul>
                      <p className="mb-3">
                        Upon termination:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Your right to use the Service will immediately cease</li>
                        <li>We may delete or deactivate your account and all related information and files</li>
                        <li>We may prohibit your future access to the Service</li>
                        <li>Any outstanding bets may be voided at our discretion</li>
                        <li>Funds in your account will be dealt with in accordance with applicable laws</li>
                      </ul>
                      <p>
                        All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>10. Contact Information</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        If you have any questions about these Terms, please contact us at:
                      </p>
                      <p className="mb-3">
                        <strong>Email:</strong> legal@weparlay.io
                      </p>
                      <p className="mb-3">
                        <strong>Postal Address:</strong><br />
                        WeParlay Inc.<br />
                        1234 Sports Ave, Suite 500<br />
                        Las Vegas, NV 89109<br />
                        United States
                      </p>
                      <p>
                        For customer support issues, please contact support@weparlay.io.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Betting Rules Tab */}
          <TabsContent value="betting">
            <Card>
              <CardHeader>
                <CardTitle>Betting Rules & Guidelines</CardTitle>
                <CardDescription>
                  Understand how bets are placed, settled, and potential issues resolved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="bet-1">
                    <AccordionTrigger>1. Bet Placement & Acceptance</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        A bet is not valid until it has been confirmed by our system and an electronic confirmation has been issued. Once confirmed, a bet cannot be canceled or changed by the user.
                      </p>
                      <p className="mb-3">
                        We reserve the right to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Refuse any bet at our sole discretion</li>
                        <li>Accept a bet at odds different from those displayed if the odds changed during bet placement</li>
                        <li>Limit bet amounts on any market</li>
                        <li>Void bets placed after an event has started</li>
                        <li>Void bets where technical or human error resulted in obvious incorrect odds</li>
                        <li>Verify the source of funds for any transaction</li>
                      </ul>
                      <p className="mb-3">
                        You should verify that all bet details are correct before confirming your bet. Once a bet is confirmed, it constitutes acceptance of the bet details and odds displayed at the time of confirmation.
                      </p>
                      <p>
                        WeParlay is not responsible for any errors or omissions in the information provided on the Service, including odds, event data, or results.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bet-2">
                    <AccordionTrigger>2. Bet Settlement & Results</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        All bet settlements are based on the official results as declared by the relevant governing body of the sport or competition in question. If no official result is declared, the result will be determined by WeParlay based on public and verifiable information from reputable sources.
                      </p>
                      <p className="mb-3">
                        Settlement principles:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Bets are settled as soon as possible after the event concludes</li>
                        <li>Results are final once settled, even if they are later changed by the official governing body</li>
                        <li>If an event is abandoned, postponed, or canceled, any bets on that event will be void unless the event is rescheduled and held within 24 hours</li>
                        <li>For live betting, the exact time of bet placement is critical for settlement purposes</li>
                        <li>Statistics corrections after the event do not affect bet settlement</li>
                      </ul>
                      <p className="mb-3">
                        In the case of conflicting results or disputed outcomes, WeParlay reserves the right to:
                      </p>
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Suspend settlement until the official result is confirmed</li>
                        <li>Settle bets based on publicly available information from multiple sources</li>
                        <li>Void bets if no reliable result can be determined</li>
                      </ul>
                      <p>
                        All settlement decisions made by WeParlay are final. Disputes regarding bet settlement must be raised within 14 days of settlement.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bet-3">
                    <AccordionTrigger>3. Bet Types & Special Rules</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay offers various bet types, each with specific rules for how they are settled. General rules for common bet types include:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Moneyline (Win/Draw/Win)</p>
                      <p className="mb-3 text-sm">
                        A bet on which team/player will win a match or event. In events where a draw is possible, three-way markets offer win/draw/win options, while two-way markets will be void in case of a draw unless otherwise stated.
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Point Spread/Handicap</p>
                      <p className="mb-3 text-sm">
                        A bet where one team/player receives a virtual head start (handicap). The final result for settlement is adjusted according to the handicap. If the handicap results in a tie, the bet will be void or settled as a push (stake returned) depending on the market.
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Totals (Over/Under)</p>
                      <p className="mb-3 text-sm">
                        A bet on whether the total score, points, goals, etc., will be over or under a specified number. If the total exactly matches the line, bets will be void or settled as a push.
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Parlays/Accumulators</p>
                      <p className="mb-3 text-sm">
                        A single bet that links together multiple selections into one bet. All selections must be correct for the bet to win. If any selection is void, the parlay continues with the remaining selections at the appropriate odds.
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Props/Specials</p>
                      <p className="mb-3 text-sm">
                        Bets on specific occurrences during an event, such as player performance or game statistics. Settlement is based on official statistics unless otherwise stated.
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Futures/Outrights</p>
                      <p className="text-sm">
                        Bets on long-term outcomes, such as tournament winners or season champions. These bets remain active until the competition concludes, and are typically not refundable if the team/player you select is eliminated.
                      </p>
                      
                      <p className="mt-4 mb-2">
                        For detailed rules on specific bet types and sports, please consult our comprehensive Sports Rules section.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bet-4">
                    <AccordionTrigger>4. Special Cases & Bet Cancellations</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay reserves the right to void or cancel bets in certain situations, including but not limited to:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Event Cancellation/Postponement</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>If an event is canceled before it starts, all bets will be void</li>
                        <li>If an event is postponed and rescheduled within 24 hours, bets remain valid</li>
                        <li>If an event is postponed beyond 24 hours, bets will be void unless otherwise specified</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Abandoned/Incomplete Events</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>If an event is abandoned or incomplete, bets on markets that have been unconditionally determined will stand</li>
                        <li>All other bets will be void unless the event is completed within 24 hours</li>
                        <li>For specific sports, minimum completion requirements may apply (e.g., 55 minutes for soccer)</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Change of Venue/Neutral Venue</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>If a venue changes from the advertised venue, bets may be void, especially if changed to the opponent's venue</li>
                        <li>Bets placed after a venue change has been announced will stand</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Participant Changes</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>If a team or player is replaced before an event starts, all bets on that event will be void</li>
                        <li>For events involving multiple participants (tournaments, etc.), participant replacements will not affect bets unless otherwise stated</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Technical Issues</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Bets placed at incorrect odds due to technical errors will be void</li>
                        <li>Bets accepted after an event has started due to technical delays will be void</li>
                        <li>Bets affected by platform failure or outages may be void at WeParlay's discretion</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Market Suspension</p>
                      <p className="text-sm">
                        WeParlay may suspend betting on any market at any time. Bets placed before suspension will stand unless circumstances dictate otherwise.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bet-5">
                    <AccordionTrigger>5. Betting Limits & Payout Restrictions</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay imposes certain limits on bets and payouts:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Minimum and Maximum Bet Amounts</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Minimum bet amount: $1.00 or equivalent in cryptocurrency</li>
                        <li>Maximum bet amounts vary by sport, competition, and market</li>
                        <li>Maximum bet limits apply per bet, not per account or per day</li>
                        <li>"Wood Tier" users have a maximum bet limit of $50 for real money bets</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Maximum Payout Limits</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Maximum payout per bet: $100,000 or equivalent in cryptocurrency</li>
                        <li>Maximum payout per day per customer: $250,000 or equivalent</li>
                        <li>Payout limits apply regardless of the odds or bet amount</li>
                        <li>Lower maximum payout limits may apply for certain markets or competitions</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Tiered Account Limits</p>
                      <p className="mb-3 text-sm">
                        WeParlay uses a tiered account system that may impose different limits based on your account level:
                      </p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Wood Tier: Limited real-money betting capabilities up to $50 per bet</li>
                        <li>Bronze Tier: Standard limits apply</li>
                        <li>Silver Tier: Increased limits based on account history</li>
                        <li>Gold Tier: Premium limits for established customers</li>
                        <li>VIP: Custom limits for VIP members</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Limit Application Rules</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>For parlays/accumulators, the lowest market limit applies to the entire bet</li>
                        <li>Where multiple limits could apply, the lower limit prevails</li>
                        <li>WeParlay reserves the right to lower limits for specific users at its discretion</li>
                        <li>Limits are applied in the currency of the account</li>
                      </ul>
                      
                      <p className="text-sm bg-muted/50 p-3 rounded-md">
                        Note: All limits may be adjusted without prior notice. It is your responsibility to ensure your bets comply with the current limits. Any stakes accepted in excess of the limits will be void.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cryptocurrency Terms Tab */}
          <TabsContent value="crypto">
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Terms & Conditions</CardTitle>
                <CardDescription>
                  Specific terms related to cryptocurrency use on WeParlay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="crypto-1">
                    <AccordionTrigger>1. Supported Cryptocurrencies & Networks</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        WeParlay currently supports the following cryptocurrencies and networks for deposits, withdrawals, and betting:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">Supported Cryptocurrencies</h4>
                          <ul className="list-disc pl-6 text-sm space-y-1">
                            <li>Bitcoin (BTC)</li>
                            <li>Ethereum (ETH)</li>
                            <li>Solana (SOL)</li>
                            <li>USD Coin (USDC)</li>
                            <li>Tether (USDT)</li>
                            <li>WePlay Token (WEP)</li>
                            <li>Polygon (MATIC)</li>
                            <li>Other ERC-20 tokens</li>
                          </ul>
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">Supported Networks</h4>
                          <ul className="list-disc pl-6 text-sm space-y-1">
                            <li>Ethereum Mainnet</li>
                            <li>Polygon Network</li>
                            <li>Optimism</li>
                            <li>Arbitrum</li>
                            <li>Base</li>
                            <li>Solana</li>
                            <li>Bitcoin Network</li>
                          </ul>
                        </div>
                      </div>
                      
                      <p className="mb-3">
                        WeParlay reserves the right to add or remove support for any cryptocurrency or network at any time. We will make reasonable efforts to notify users of such changes.
                      </p>
                      
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-amber-800 dark:text-amber-300 text-sm">
                        <p className="font-medium mb-1">Important:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Always ensure you are sending cryptocurrency on the correct network. Sending assets on an unsupported network may result in permanent loss.</li>
                          <li>Minimum deposit and withdrawal amounts apply for each cryptocurrency.</li>
                          <li>WeParlay may temporarily suspend deposits or withdrawals of certain cryptocurrencies for maintenance or security reasons.</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crypto-2">
                    <AccordionTrigger>2. Deposits & Withdrawals</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        When using cryptocurrencies with WeParlay, the following terms apply to deposits and withdrawals:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Cryptocurrency Deposits</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Deposited cryptocurrency will be credited to your account after the required number of network confirmations</li>
                        <li>Required confirmations vary by cryptocurrency: BTC (3), ETH (15), SOL (32), USDC/USDT (15)</li>
                        <li>Deposit addresses are generated uniquely for each user and should not be shared</li>
                        <li>Minimum deposit amounts apply and vary by cryptocurrency</li>
                        <li>Deposits from smart contracts, mixing services, or high-risk sources may be rejected</li>
                        <li>WeParlay is not responsible for deposits sent to incorrect addresses or on incorrect networks</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Cryptocurrency Withdrawals</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Withdrawals are processed after verification and security checks</li>
                        <li>Withdrawal processing times vary by cryptocurrency and network congestion</li>
                        <li>You are responsible for providing the correct withdrawal address</li>
                        <li>Once a withdrawal is processed and broadcast to the blockchain, it cannot be reversed</li>
                        <li>Minimum and maximum withdrawal limits apply and vary by cryptocurrency</li>
                        <li>Withdrawal fees apply and will be displayed before confirmation</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Transaction Verification</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>New deposit addresses may require additional verification for security purposes</li>
                        <li>Large withdrawals may require enhanced verification and security checks</li>
                        <li>WeParlay monitors transactions for compliance with anti-money laundering regulations</li>
                        <li>Suspicious transactions may be delayed or rejected</li>
                      </ul>
                      
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        <p className="mb-2">
                          All cryptocurrency transactions are final once confirmed on the blockchain. WeParlay has no ability to reverse, cancel, or refund cryptocurrency transactions after they have been broadcast to the network.
                        </p>
                        <p>
                          For security reasons, large or unusual withdrawal patterns may trigger additional security measures, potentially resulting in processing delays.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crypto-3">
                    <AccordionTrigger>3. Exchange Rates & Volatility</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        Cryptocurrency values can be highly volatile, which affects deposits, withdrawals, and bet values:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Exchange Rate Determination</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>WeParlay uses market rates from reputable cryptocurrency exchanges</li>
                        <li>Exchange rates are updated frequently but may not reflect real-time market prices exactly</li>
                        <li>A spread may be applied to exchange rates for operational purposes</li>
                        <li>The applicable exchange rate is displayed before confirming transactions</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Volatility Risks</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>The USD value of cryptocurrency deposits and withdrawals may change significantly due to market volatility</li>
                        <li>When placing bets with cryptocurrency, the bet amount is converted to USD at the current exchange rate</li>
                        <li>Winnings are paid in the currency the bet was placed in</li>
                        <li>The USD value of cryptocurrency winnings may differ significantly from the time the bet was placed</li>
                        <li>WeParlay is not responsible for any losses or gains due to cryptocurrency price volatility</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Rate Locks</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>For deposits, the exchange rate is locked at the time the transaction receives the required confirmations</li>
                        <li>For withdrawals, the exchange rate is locked at the time the withdrawal is confirmed by the user</li>
                        <li>For bets, the exchange rate is locked at the time the bet is confirmed</li>
                      </ul>
                      
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-amber-800 dark:text-amber-300 text-sm">
                        <p className="mb-2">
                          <strong>Volatility Warning:</strong> Cryptocurrency prices can fluctuate dramatically in short periods. A bet placed using cryptocurrency may have a significantly different USD value when settled compared to when it was placed. Users accept this inherent volatility risk when using cryptocurrencies.
                        </p>
                        <p>
                          To minimize volatility risk, users may choose to use stablecoins such as USDC or USDT, which are designed to maintain a stable value relative to USD.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crypto-4">
                    <AccordionTrigger>4. Wallet Security & User Responsibilities</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        When using cryptocurrency with WeParlay, you are responsible for the security of your own cryptocurrency wallets:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">User Responsibilities</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>You must have full ownership and control of any cryptocurrency wallet you connect to WeParlay</li>
                        <li>You are responsible for securing your private keys and seed phrases</li>
                        <li>WeParlay never stores or has access to your private keys, seed phrases, or wallet passwords</li>
                        <li>You must verify all transaction details before confirming</li>
                        <li>You are responsible for any transaction fees (gas fees) required for blockchain transactions</li>
                        <li>You must ensure you are sending cryptocurrency on the correct network</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">WeParlay's Security Measures</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>WeParlay implements industry-standard security measures for cryptocurrency storage</li>
                        <li>The majority of user funds are stored in cold wallets (offline storage)</li>
                        <li>Hot wallets (online storage) are used only for operational needs with limited amounts</li>
                        <li>Multi-signature authorization is required for withdrawals from cold storage</li>
                        <li>Regular security audits are conducted by independent third parties</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Smart Contract Interactions</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>WeParlay may use smart contracts for certain operations</li>
                        <li>All smart contracts used by WeParlay undergo security audits</li>
                        <li>You should review any smart contract permissions before approving them</li>
                        <li>WeParlay is not responsible for losses resulting from user interaction with smart contracts</li>
                      </ul>
                      
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        <p className="font-medium mb-2">Security Best Practices:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Use hardware wallets for large amounts of cryptocurrency</li>
                          <li>Enable two-factor authentication where available</li>
                          <li>Never share your private keys or seed phrases with anyone</li>
                          <li>Verify website URLs carefully to avoid phishing attempts</li>
                          <li>Always double-check wallet addresses before confirming transactions</li>
                          <li>Consider using small test transactions before large transfers</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crypto-5">
                    <AccordionTrigger>5. Regulatory Compliance & Limitations</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-3">
                        The use of cryptocurrencies on WeParlay is subject to various regulatory requirements:
                      </p>
                      
                      <p className="font-medium mt-3 mb-1">Compliance Requirements</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>WeParlay complies with applicable anti-money laundering (AML) and know-your-customer (KYC) regulations</li>
                        <li>Cryptocurrency transactions may require additional verification depending on amount and frequency</li>
                        <li>We may be required to report certain transactions to regulatory authorities</li>
                        <li>We may freeze accounts or transactions when required by law or regulation</li>
                        <li>We cooperate with law enforcement and regulatory inquiries regarding cryptocurrency transactions</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Jurisdictional Limitations</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>Cryptocurrency functionality may be limited or unavailable in certain jurisdictions</li>
                        <li>Users are responsible for complying with local laws regarding cryptocurrency usage</li>
                        <li>WeParlay reserves the right to restrict cryptocurrency functionality based on user location</li>
                        <li>Changes in regulations may affect the availability of cryptocurrency services</li>
                      </ul>
                      
                      <p className="font-medium mt-3 mb-1">Tax Implications</p>
                      <ul className="list-disc pl-6 mb-3 text-sm space-y-1">
                        <li>You are solely responsible for determining and paying any applicable taxes on cryptocurrency transactions</li>
                        <li>WeParlay does not provide tax advice or calculate tax liability for users</li>
                        <li>Cryptocurrency transactions, including trades, deposits, withdrawals, and winnings, may be taxable events</li>
                        <li>Transaction records are available for users to download for tax reporting purposes</li>
                      </ul>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-blue-800 dark:text-blue-300 text-sm">
                        <p className="mb-2">
                          <strong>Regulatory Evolution:</strong> Cryptocurrency regulations are evolving globally. WeParlay strives to comply with all applicable regulations as they develop.
                        </p>
                        <p>
                          We may modify our cryptocurrency terms and services as needed to maintain compliance with changing regulatory requirements, potentially affecting the availability or functionality of cryptocurrency features on our platform.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex items-center justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/privacy-policy">
              View Privacy Policy
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/security">
              Security Information
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/support">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;