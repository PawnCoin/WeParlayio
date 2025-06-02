import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Globe, 
  Clock,
  User,
  CreditCard,
  Eye,
  Lock
} from 'lucide-react';

export default function LegalComplianceDashboard() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  // This would come from your compliance management system
  const complianceStatus = {
    licenses: [
      {
        jurisdiction: 'Malta Gaming Authority',
        licenseNumber: 'MGA/B2C/123/2024',
        status: 'active',
        expiry: '2025-12-31',
        type: 'Remote Gaming License'
      },
      {
        jurisdiction: 'UK Gambling Commission',
        licenseNumber: 'UKGC/456/2024',
        status: 'active',
        expiry: '2025-11-30',
        type: 'Remote Gambling License'
      },
      {
        jurisdiction: 'Gibraltar Regulatory Authority',
        licenseNumber: 'GRA/789/2024',
        status: 'pending_renewal',
        expiry: '2025-01-15',
        type: 'B2C Remote Gambling License'
      }
    ],
    jurisdictionRestrictions: {
      blocked: ['US', 'FR', 'AU', 'IT', 'ES'],
      restricted: ['DE', 'SE', 'NO'],
      allowed: ['GB', 'MT', 'GI', 'CA', 'IE']
    },
    ageVerification: {
      enabled: true,
      minimumAge: 18,
      documentTypes: ['passport', 'driving_license', 'national_id'],
      verificationProvider: 'Jumio',
      averageVerificationTime: '4.2 minutes'
    },
    responsibleGambling: {
      selfExclusion: true,
      depositLimits: true,
      sessionTimeouts: true,
      realityChecks: true,
      coolingOffPeriods: true
    }
  };

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending_renewal': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getJurisdictionAccess = (country: string) => {
    if (complianceStatus.jurisdictionRestrictions.blocked.includes(country)) {
      return { status: 'blocked', color: 'bg-red-500', text: 'Blocked' };
    }
    if (complianceStatus.jurisdictionRestrictions.restricted.includes(country)) {
      return { status: 'restricted', color: 'bg-yellow-500', text: 'Restricted' };
    }
    return { status: 'allowed', color: 'bg-green-500', text: 'Allowed' };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Legal Compliance Dashboard</h1>
        <p className="text-gray-600">Regulatory oversight and compliance management</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStatus.licenses.filter(l => l.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {complianceStatus.licenses.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurisdictions</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStatus.jurisdictionRestrictions.allowed.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Markets accessible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age Verification</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStatus.ageVerification.averageVerificationTime}
            </div>
            <p className="text-xs text-muted-foreground">
              Average verification time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RG Features</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/5</div>
            <p className="text-xs text-muted-foreground">
              Responsible gambling tools
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="licenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="licenses">Gaming Licenses</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdiction Access</TabsTrigger>
          <TabsTrigger value="age-verification">Age Verification</TabsTrigger>
          <TabsTrigger value="responsible-gambling">Responsible Gambling</TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming License Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatus.licenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getLicenseStatusColor(license.status)}`}></div>
                      <div>
                        <h4 className="font-semibold">{license.jurisdiction}</h4>
                        <p className="text-sm text-gray-600">{license.type}</p>
                        <p className="text-xs text-gray-500">License: {license.licenseNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                        {license.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Expires: {license.expiry}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jurisdictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jurisdiction Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Allowed Markets</h4>
                  <div className="space-y-2">
                    {complianceStatus.jurisdictionRestrictions.allowed.map(country => (
                      <Badge key={country} className="mr-2 bg-green-100 text-green-800">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-yellow-700">Restricted Markets</h4>
                  <div className="space-y-2">
                    {complianceStatus.jurisdictionRestrictions.restricted.map(country => (
                      <Badge key={country} className="mr-2 bg-yellow-100 text-yellow-800">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Blocked Markets</h4>
                  <div className="space-y-2">
                    {complianceStatus.jurisdictionRestrictions.blocked.map(country => (
                      <Badge key={country} className="mr-2 bg-red-100 text-red-800">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="age-verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Age Verification System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Minimum Age</span>
                    <Badge>{complianceStatus.ageVerification.minimumAge}+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Verification Provider</span>
                    <Badge variant="outline">{complianceStatus.ageVerification.verificationProvider}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Average Processing</span>
                    <Badge variant="outline">{complianceStatus.ageVerification.averageVerificationTime}</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Accepted Documents</h4>
                  <div className="space-y-2">
                    {complianceStatus.ageVerification.documentTypes.map(docType => (
                      <div key={docType} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="capitalize">{docType.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsible-gambling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Responsible Gambling Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(complianceStatus.responsibleGambling).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center space-x-2">
                      {enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={enabled ? 'default' : 'destructive'}>
                        {enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Gibraltar license expires in 45 days. Renewal application submitted and pending approval.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All responsible gambling features are active and compliant with regulatory requirements.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}