
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Eye, 
  FileText, 
  CreditCard,
  Clock,
  UserCheck,
  DollarSign,
  Smartphone
} from 'lucide-react';

interface SecurityCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  description: string;
  required: boolean;
  actionRequired?: string;
}

const SecurityAuditPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    // Initialize security checks
    const checks: SecurityCheck[] = [
      {
        id: 'identity_verification',
        name: 'Identity Verification (KYC)',
        status: user?.kycVerified ? 'passed' : 'failed',
        description: 'Government ID verification required for banking operations',
        required: true,
        actionRequired: !user?.kycVerified ? 'Upload government-issued ID' : undefined
      },
      {
        id: 'address_verification',
        name: 'Address Verification',
        status: user?.addressVerified ? 'passed' : 'failed',
        description: 'Proof of address required for withdrawals over $1,000',
        required: true,
        actionRequired: !user?.addressVerified ? 'Upload utility bill or bank statement' : undefined
      },
      {
        id: 'two_factor_auth',
        name: '2FA for Banking',
        status: user?.banking2FA ? 'passed' : 'warning',
        description: 'Two-factor authentication for all banking operations',
        required: true,
        actionRequired: !user?.banking2FA ? 'Enable 2FA for banking' : undefined
      },
      {
        id: 'bank_account_verified',
        name: 'Bank Account Verification',
        status: user?.bankAccountVerified ? 'passed' : 'pending',
        description: 'Micro-deposit verification completed',
        required: true,
        actionRequired: !user?.bankAccountVerified ? 'Complete micro-deposit verification' : undefined
      },
      {
        id: 'ssl_certificate',
        name: 'SSL Certificate Validation',
        status: window.location.protocol === 'https:' ? 'passed' : 'failed',
        description: 'Secure connection verified',
        required: true,
        actionRequired: window.location.protocol !== 'https:' ? 'Connection not secure!' : undefined
      },
      {
        id: 'withdrawal_limits',
        name: 'Withdrawal Limits Set',
        status: user?.withdrawalLimits ? 'passed' : 'warning',
        description: 'Daily/Monthly withdrawal limits configured',
        required: false,
        actionRequired: !user?.withdrawalLimits ? 'Set withdrawal limits for security' : undefined
      },
      {
        id: 'device_fingerprinting',
        name: 'Device Recognition',
        status: user?.deviceFingerprint ? 'passed' : 'warning',
        description: 'Device fingerprinting for fraud detection',
        required: false
      },
      {
        id: 'transaction_monitoring',
        name: 'Transaction Monitoring',
        status: 'passed', // Always enabled
        description: 'AI-powered fraud detection monitoring',
        required: true
      }
    ];

    setSecurityChecks(checks);

    // Calculate security score
    const totalChecks = checks.length;
    const passedChecks = checks.filter(check => check.status === 'passed').length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    setOverallScore(score);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const criticalIssues = securityChecks.filter(check => 
    check.required && (check.status === 'failed' || check.status === 'warning')
  );

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card className={`border-2 ${overallScore >= 80 ? 'border-green-500' : overallScore >= 60 ? 'border-yellow-500' : 'border-red-500'}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Banking Security Score
          </CardTitle>
          <div className={`text-6xl font-bold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {overallScore}%
          </div>
          <CardDescription>
            {overallScore >= 80 ? 'Excellent Security' : 
             overallScore >= 60 ? 'Good Security - Improvements Needed' : 
             'Poor Security - Immediate Action Required'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Security Issues ({criticalIssues.length})
            </CardTitle>
            <CardDescription className="text-red-600">
              These issues must be resolved before banking operations can be considered secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.status)}
                    <div>
                      <div className="font-medium text-red-700">{issue.name}</div>
                      {issue.actionRequired && (
                        <div className="text-sm text-red-600">{issue.actionRequired}</div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="destructive">
                    Fix Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Security Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Details</CardTitle>
          <CardDescription>Comprehensive banking security verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{check.name}</span>
                      {check.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                    {check.actionRequired && (
                      <p className="text-sm text-red-600 font-medium">{check.actionRequired}</p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusBadge(check.status)}>
                  {check.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Security Features */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Security Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">View Security Logs</span>
              </div>
              <span className="text-sm text-muted-foreground">Check all login and transaction attempts</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Insurance Information</span>
              </div>
              <span className="text-sm text-muted-foreground">FDIC insurance and crypto backing details</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Set Withdrawal Limits</span>
              </div>
              <span className="text-sm text-muted-foreground">Configure daily/monthly limits</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">Trusted Devices</span>
              </div>
              <span className="text-sm text-muted-foreground">Manage authorized devices</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAuditPanel;
