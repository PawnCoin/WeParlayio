import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MessageSquare, Send, Shield, Users } from 'lucide-react';

interface SMSTemplate {
  welcome: string;
  bet_confirmation: string;
  win_notification: string;
  security_alert: string;
}

const SmsTemplateSettings = () => {
  const [templates, setTemplates] = useState<SMSTemplate>({
    welcome: '',
    bet_confirmation: '',
    win_notification: '',
    security_alert: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState<keyof SMSTemplate>('welcome');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['/api/sms/templates'],
    retry: false
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ templateType, template }: { templateType: string; template: string }) => {
      return apiRequest('POST', '/api/sms/templates', { templateType, template });
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "SMS template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms/templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (templatesData?.templates) {
      setTemplates(templatesData.templates);
    }
  }, [templatesData]);

  const handleTemplateChange = (value: string) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: value
    }));
  };

  const handleSaveTemplate = () => {
    saveTemplateMutation.mutate({
      templateType: selectedTemplate,
      template: templates[selectedTemplate]
    });
  };

  const templateDescriptions = {
    welcome: 'Sent when new users sign up. Variables: ${balance}',
    bet_confirmation: 'Sent when bets are placed. Variables: ${event}, ${betType}, ${amount}',
    win_notification: 'Sent when users win bets. Variables: ${winAmount}, ${event}',
    security_alert: 'Sent for security events. Variables: ${action}, ${time}'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          SMS Template Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize SMS and MMS templates for automated user communications
        </p>
      </div>

      {/* SMS Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Can send SMS</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diamond Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">Can send MMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">SMS + MMS sent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Template Types</CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(templates).map((templateKey) => (
              <Button
                key={templateKey}
                variant={selectedTemplate === templateKey ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedTemplate(templateKey as keyof SMSTemplate)}
              >
                {templateKey.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit {selectedTemplate.replace('_', ' ').toUpperCase()} Template</CardTitle>
            <CardDescription>
              {templateDescriptions[selectedTemplate]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={templates[selectedTemplate]}
              onChange={(e) => handleTemplateChange(e.target.value)}
              placeholder="Enter your SMS template..."
              className="min-h-[200px]"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Character count: {templates[selectedTemplate]?.length || 0}/160
              </p>
              <Button 
                onClick={handleSaveTemplate}
                disabled={saveTemplateMutation.isPending}
              >
                {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Access Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>VIP SMS Access Levels</CardTitle>
          <CardDescription>User permissions for SMS and MMS features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-500">Bronze/Silver/Gold</h4>
              <p className="text-sm text-muted-foreground mt-1">No SMS access</p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-semibold text-yellow-700">VIP Tier</h4>
              <p className="text-sm text-muted-foreground mt-1">50 SMS per day</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-700">Diamond Tier</h4>
              <p className="text-sm text-muted-foreground mt-1">200 SMS + MMS per day</p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-700">Admin</h4>
              <p className="text-sm text-muted-foreground mt-1">Unlimited + Template editing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsTemplateSettings;