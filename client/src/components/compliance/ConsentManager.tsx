
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Mail, 
  Cookie, 
  Database, 
  FileText, 
  CheckCircle, 
  Clock,
  Download,
  Eye,
  Lock
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ConsentItem {
  type: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  value: boolean;
  lastUpdated?: Date;
}

const ConsentManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      type: 'terms',
      label: 'Terms of Service',
      description: 'Agreement to our terms and conditions for using WeParlay',
      required: true,
      icon: <FileText className="h-4 w-4" />,
      value: true
    },
    {
      type: 'privacy',
      label: 'Privacy Policy',
      description: 'Consent to data collection and processing as outlined in our privacy policy',
      required: true,
      icon: <Shield className="h-4 w-4" />,
      value: true
    },
    {
      type: 'marketing',
      label: 'Marketing Communications',
      description: 'Receive promotional emails, newsletters, and betting updates',
      required: false,
      icon: <Mail className="h-4 w-4" />,
      value: false
    },
    {
      type: 'cookies',
      label: 'Analytics Cookies',
      description: 'Allow cookies for analytics and personalized betting experience',
      required: false,
      icon: <Cookie className="h-4 w-4" />,
      value: true
    },
    {
      type: 'data-processing',
      label: 'Enhanced Data Processing',
      description: 'Process additional data for improved odds and recommendations',
      required: false,
      icon: <Database className="h-4 w-4" />,
      value: false
    }
  ]);

  // Fetch user consent history
  const { data: consentHistory } = useQuery({
    queryKey: [`/api/consent/user-consents/${user?.id}`],
    enabled: !!user?.id,
  });

  // Record consent mutation
  const recordConsentMutation = useMutation({
    mutationFn: async (consentData: any) => {
      const response = await apiRequest('POST', '/api/consent/record-consent', consentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/consent/user-consents/${user?.id}`] });
      toast({
        title: "Consent Updated",
        description: "Your consent preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update consent preferences.",
        variant: "destructive",
      });
    }
  });

  // Update multiple consents mutation
  const updateConsentsMutation = useMutation({
    mutationFn: async (consentsData: any) => {
      const response = await apiRequest('PUT', `/api/consent/update-consent/${user?.id}`, consentsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/consent/user-consents/${user?.id}`] });
      toast({
        title: "Preferences Saved",
        description: "All consent preferences have been updated successfully.",
      });
    }
  });

  const handleConsentChange = async (consentType: string, newValue: boolean) => {
    const previousValue = consents.find(c => c.type === consentType)?.value;
    
    // Update local state
    setConsents(prev => prev.map(consent => 
      consent.type === consentType 
        ? { ...consent, value: newValue, lastUpdated: new Date() }
        : consent
    ));

    // Record the consent change
    if (user) {
      await recordConsentMutation.mutateAsync({
        userId: user.id,
        consentType,
        consented: newValue,
        source: 'consent-manager',
        additionalData: { previousValue }
      });
    }
  };

  const handleBulkSave = () => {
    if (!user) return;

    const consentChanges = consents.map(consent => ({
      type: consent.type,
      value: consent.value,
      previousValue: consentHistory?.find((h: any) => h.consentType === consent.type)?.consented
    }));

    updateConsentsMutation.mutate({ consents: consentChanges });
  };

  const exportConsentData = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/consent/export/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('weparlay-token')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weparlay-consent-data-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Your consent data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export consent data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            Privacy & Consent Management
          </CardTitle>
          <CardDescription>
            Manage your data privacy preferences and consent settings. We respect your privacy and give you full control over your data.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Preferences</CardTitle>
          <CardDescription>
            Choose which data processing activities you consent to. Required consents are necessary for platform functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {consents.map((consent, index) => (
            <div key={consent.type}>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={consent.type}
                  checked={consent.value}
                  onCheckedChange={(checked) => handleConsentChange(consent.type, checked as boolean)}
                  disabled={consent.required}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {consent.icon}
                    <Label 
                      htmlFor={consent.type} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {consent.label}
                    </Label>
                    {consent.required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                    {consent.lastUpdated && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Updated {consent.lastUpdated.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {consent.description}
                  </p>
                </div>
                <div className="flex items-center">
                  {consent.value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
              {index < consents.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleBulkSave}
              disabled={updateConsentsMutation.isPending}
            >
              {updateConsentsMutation.isPending ? 'Saving...' : 'Save All Preferences'}
            </Button>
            
            <Button variant="outline" onClick={exportConsentData}>
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent History */}
      {consentHistory && consentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Consent History
            </CardTitle>
            <CardDescription>
              View your consent history and changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consentHistory.slice(0, 5).map((record: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={record.consented ? "default" : "secondary"}>
                      {record.consented ? 'Granted' : 'Withdrawn'}
                    </Badge>
                    <span className="font-medium">{record.consentType}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Right to Access</h4>
              <p className="text-sm text-muted-foreground">
                You can request access to your personal data at any time.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Right to Rectification</h4>
              <p className="text-sm text-muted-foreground">
                You can request correction of inaccurate personal data.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Right to Erasure</h4>
              <p className="text-sm text-muted-foreground">
                You can request deletion of your personal data in certain circumstances.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Right to Withdraw Consent</h4>
              <p className="text-sm text-muted-foreground">
                You can withdraw consent at any time using the controls above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentManager;
