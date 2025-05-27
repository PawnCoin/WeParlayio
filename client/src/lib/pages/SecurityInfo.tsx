import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Database, Eye, AlertTriangle, FileKey, Clock, User } from "lucide-react";

export default function SecurityInfo() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">WeParlay Security Measures</CardTitle>
          <CardDescription>How we protect your data and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Shield className="h-6 w-6" /> Our Security Commitment
                </h2>
                <p className="mt-2">
                  At WeParlay, we are committed to providing industry-leading security measures to protect your personal information, financial data, and betting activity. Our multi-layered security approach ensures that you can enjoy our services with peace of mind.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Data Encryption
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    All sensitive data is encrypted using industry-standard protocols:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>TLS 1.3 encryption for all data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>End-to-end encryption for financial transactions</li>
                    <li>Secure websocket connections for real-time data</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" /> Database Security
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    Your data is stored in secure, enterprise-grade databases with multiple safeguards:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Regular security audits and penetration testing</li>
                    <li>Real-time database monitoring for suspicious activities</li>
                    <li>Automatic backups with point-in-time recovery</li>
                    <li>Granular access controls and least privilege principles</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <FileKey className="h-5 w-5" /> Authentication & Access
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    We employ advanced authentication measures to protect your account:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>OAuth 2.0 secure authentication with trusted providers</li>
                    <li>Multi-factor authentication options</li>
                    <li>Secure session management with automatic timeouts</li>
                    <li>Biometric authentication support on compatible devices</li>
                    <li>Suspicious login detection and prevention</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Fraud Prevention
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    Our advanced fraud detection systems help protect you and our platform:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Real-time transaction monitoring</li>
                    <li>Machine learning algorithms to detect unusual patterns</li>
                    <li>IP-based geolocation verification</li>
                    <li>Device fingerprinting for suspicious activity detection</li>
                    <li>Immediate notifications for unexpected account activity</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Privacy Protection
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    Your privacy is paramount:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Strict data minimization practices - we only collect what we need</li>
                    <li>Regular data purging of unnecessary information</li>
                    <li>Anonymous analytics where possible</li>
                    <li>Opt-out options for non-essential data collection</li>
                    <li>Transparent privacy policies and regular updates</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Continuous Security Updates
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    We maintain a proactive security posture:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Regular security patches and dependency updates</li>
                    <li>Ongoing vulnerability assessments</li>
                    <li>Bug bounty program for responsible disclosure</li>
                    <li>Continuous monitoring of security threats</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" /> User Security Controls
                </h2>
                <div className="ml-7 space-y-2">
                  <p>
                    We empower you with controls over your own security:
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Ability to view and manage active sessions</li>
                    <li>Options to enable additional security features</li>
                    <li>Account activity logs for transparency</li>
                    <li>Customizable security notifications</li>
                    <li>Easy account recovery options with secure verification</li>
                  </ul>
                </div>
              </section>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 mt-6">
                <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">Our Security Certifications</h2>
                <p className="mt-2 text-green-700 dark:text-green-300">
                  WeParlay undergoes regular security audits and complies with industry standards to ensure the highest level of protection for our users.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-semibold">Report Security Concerns</h2>
                <p className="mt-2">
                  If you believe you've found a security vulnerability or have concerns about your account security, please contact us immediately at <a href="mailto:security@weparlay.io" className="text-primary hover:underline">security@weparlay.io</a>.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}