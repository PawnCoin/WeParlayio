import React from 'react';
import TrustedPaymentGateways from '@/components/payments/TrustedPaymentGateways';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard } from 'lucide-react';

const PaymentDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6 text-green-600" />
            Payment Gateway Demo
          </CardTitle>
          <CardDescription>
            Experience our secure, enterprise-grade payment processing system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Live Payment Integration</span>
            </div>
            <p className="text-green-700 text-sm">
              This is a fully functional payment system with real Cash App and PayPal integration. 
              All transactions are processed securely through PCI-compliant gateways with complete transparency.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <TrustedPaymentGateways />
    </div>
  );
};

export default PaymentDemo;