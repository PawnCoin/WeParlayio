import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Users, Database, Globe, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Privacy Policy
          </CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              At WeParlay, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your personal information when you use our sports betting platform.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Name, email address, and phone number</li>
              <li>Date of birth for age verification</li>
              <li>Government-issued identification for KYC compliance</li>
              <li>Payment information (processed securely through third parties)</li>
              <li>Profile preferences and settings</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Usage Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Betting history and transaction records</li>
              <li>Platform usage patterns and preferences</li>
              <li>Device information and IP addresses</li>
              <li>Browser type and operating system</li>
              <li>Referral sources and marketing campaign data</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Financial Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Cryptocurrency wallet addresses</li>
              <li>Transaction history and amounts</li>
              <li>Deposit and withdrawal records</li>
              <li>WeParlay Cash balance and transactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Platform Operations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Process bets and handle payouts</li>
                <li>Manage account security and authentication</li>
                <li>Provide customer support</li>
                <li>Verify identity and prevent fraud</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Legal Compliance</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>KYC (Know Your Customer) verification</li>
                <li>Anti-money laundering (AML) compliance</li>
                <li>Tax reporting requirements</li>
                <li>Regulatory reporting and audits</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Service Improvement</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Analyze usage patterns</li>
                <li>Improve platform functionality</li>
                <li>Develop new features</li>
                <li>Optimize user experience</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Communications</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Send transaction confirmations</li>
                <li>Provide account notifications</li>
                <li>Share platform updates</li>
                <li>Marketing communications (with consent)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Data Protection & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Encryption & Security</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
              <li>All data transmitted using TLS 1.3 encryption</li>
              <li>Passwords hashed using bcrypt with salt</li>
              <li>Sensitive data encrypted at rest using AES-256</li>
              <li>Regular security audits and penetration testing</li>
              <li>Two-factor authentication for account protection</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Access Controls</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li>Role-based access control for staff</li>
              <li>Minimal data access principle</li>
              <li>Regular access reviews and audits</li>
              <li>Secure development practices</li>
              <li>24/7 security monitoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Data Sharing & Third Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">We share your information with:</h4>
            <div className="space-y-3">
              <div className="border-l-4 border-orange-500 pl-4">
                <h5 className="font-medium">Payment Processors</h5>
                <p className="text-sm text-gray-600">
                  PayPal, Cash App, and Stripe for secure payment processing
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium">Identity Verification</h5>
                <p className="text-sm text-gray-600">
                  KYC/AML service providers for identity verification and compliance
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h5 className="font-medium">Legal Authorities</h5>
                <p className="text-sm text-gray-600">
                  When required by law or to protect our legal rights
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-medium">Service Providers</h5>
                <p className="text-sm text-gray-600">
                  Analytics, email services, and infrastructure providers under strict agreements
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">We NEVER sell your personal data</h4>
            <p className="text-red-700 text-sm">
              WeParlay does not sell, rent, or lease your personal information to third parties 
              for marketing purposes. Any data sharing is strictly for operational or legal requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Your Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">GDPR Rights (EU Users)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Right to access your data</li>
                <li>Right to rectification</li>
                <li>Right to erasure</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">CCPA Rights (California Users)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Right to know about data collection</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of sale</li>
                <li>Right to non-discrimination</li>
                <li>Right to correct inaccurate data</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">How to Exercise Your Rights</h4>
            <p className="text-green-700 text-sm mb-2">
              Contact us at <strong>support@weparlay.io</strong> to exercise any of your privacy rights. 
              We will respond within 30 days and verify your identity before processing your request.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Data Retention</h4>
            <p className="text-sm text-gray-600">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. Betting records are kept for 7 years as required by law.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">International Transfers</h4>
            <p className="text-sm text-gray-600">
              Your data may be transferred to and processed in countries outside your residence. 
              We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Children's Privacy</h4>
            <p className="text-sm text-gray-600">
              Our platform is not intended for users under 18. We do not knowingly collect 
              personal information from minors. If we discover such collection, we will delete it immediately.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Policy Updates</h4>
            <p className="text-sm text-gray-600">
              We may update this Privacy Policy periodically. Material changes will be communicated 
              via email or platform notification. Continued use constitutes acceptance of updates.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Data Protection Officer</h4>
              <p className="text-sm text-gray-600">
                Email: <strong>privacy@weparlay.io</strong>
              </p>
            </div>

            <div>
              <h4 className="font-medium">General Support</h4>
              <p className="text-sm text-gray-600">
                Email: <strong>support@weparlay.io</strong>
              </p>
            </div>

            <div>
              <h4 className="font-medium">Mailing Address</h4>
              <p className="text-sm text-gray-600">
                WeParlay, Inc.<br />
                Privacy Department<br />
                [Your Business Address]<br />
                [City, State, ZIP Code]
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Questions about this policy?</strong> We're here to help! 
              Contact us at <strong>privacy@weparlay.io</strong> and we'll respond within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;