import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Info, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LegalDisclaimerProps {
  onAccept?: () => void;
  mode?: 'dialog' | 'inline' | 'minimal';
  trigger?: React.ReactNode;
}

// List of states where online betting is legal
const LEGAL_STATES = [
  'Nevada', 'New Jersey', 'Pennsylvania', 'Michigan', 'Illinois', 
  'Colorado', 'Indiana', 'Iowa', 'New Hampshire', 'Rhode Island', 
  'Tennessee', 'Virginia', 'West Virginia', 'Arizona', 'Wyoming',
  'Connecticut', 'Louisiana', 'Maryland', 'New York', 'Oregon'
];

// States with partial or restricted legal betting
const RESTRICTED_STATES = [
  'Washington', 'Montana', 'Mississippi', 'Arkansas', 'Delaware', 
  'South Dakota', 'North Dakota'
];

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ 
  onAccept, 
  mode = 'dialog',
  trigger
}) => {
  const [accepted, setAccepted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');
  const [state, setState] = useState<string | null>(null);
  const [age, setAge] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleAccept = () => {
    if (!age) {
      toast({
        title: "Age verification required",
        description: "You must confirm you are 21 years or older to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!state) {
      toast({
        title: "State selection required",
        description: "Please select your state of residence to continue.",
        variant: "destructive"
      });
      return;
    }
    
    const isRestrictedState = RESTRICTED_STATES.includes(state);
    const isIllegalState = !LEGAL_STATES.includes(state) && !RESTRICTED_STATES.includes(state);
    
    if (isIllegalState) {
      toast({
        title: "Geographic Restriction",
        description: `Online betting is not permitted in ${state}. You can only use the platform with WeParlay Cash.`,
        variant: "destructive"
      });
    } else if (isRestrictedState) {
      toast({
        title: "Restricted State",
        description: `${state} has specific restrictions for online betting. Some features may be limited.`,
        variant: "default"
      });
    }
    
    // Save user preferences
    localStorage.setItem('weparlay_legal_accepted', 'true');
    localStorage.setItem('weparlay_user_state', state);
    
    setAccepted(true);
    setShowDialog(false);
    
    if (onAccept) {
      onAccept();
    }
  };
  
  const disclaimerContent = (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="terms">Terms of Use</TabsTrigger>
          <TabsTrigger value="legal">Legal Status</TabsTrigger>
          <TabsTrigger value="responsible">Responsible Gaming</TabsTrigger>
        </TabsList>
        
        <TabsContent value="terms" className="space-y-4 py-4">
          <h3 className="text-lg font-semibold">Terms of Service</h3>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4 pr-4">
              <p>By using WeParlay.io, you agree to abide by the following terms and conditions:</p>
              
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="legal-compliance">
                  <AccordionTrigger>Legal Compliance</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">All users must:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Be at least 21 years of age</li>
                      <li>Reside in a jurisdiction where online betting is legal</li>
                      <li>Use the platform in accordance with all applicable laws and regulations</li>
                      <li>Not use VPNs or other methods to circumvent geographic restrictions</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="account">
                  <AccordionTrigger>Account Responsibilities</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Users are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Maintaining the security of their account credentials</li>
                      <li>Ensuring all personal information is accurate and up-to-date</li>
                      <li>All activity that occurs under their account</li>
                      <li>Reporting any unauthorized account access immediately</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="payments">
                  <AccordionTrigger>Payment Terms</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">By using real money features:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You authorize WeParlay to process deposits and withdrawals per your instructions</li>
                      <li>All transactions are subject to review for security and compliance purposes</li>
                      <li>Withdrawals may require identity verification as required by law</li>
                      <li>WeParlay reserves the right to refuse service to anyone for legitimate legal reasons</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="conduct">
                  <AccordionTrigger>Code of Conduct</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Users must not:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Engage in any form of collusion or fraudulent activity</li>
                      <li>Use automated systems or bots to place bets</li>
                      <li>Harass, threaten, or abuse other users</li>
                      <li>Attempt to manipulate betting outcomes or exploit platform vulnerabilities</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="changes">
                  <AccordionTrigger>Changes to Terms</AccordionTrigger>
                  <AccordionContent>
                    <p>WeParlay reserves the right to modify these terms at any time. Users will be notified of significant changes and continued use of the service constitutes acceptance of the updated terms.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <p className="text-sm text-muted-foreground">
                These terms constitute the entire agreement between users and WeParlay regarding the use of the service.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="legal" className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">State-by-State Legal Status</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Select Your State of Residence</Label>
                  <select 
                    value={state || ''} 
                    onChange={(e) => setState(e.target.value || null)}
                    className="w-full p-2 rounded-md border"
                  >
                    <option value="">Select a state...</option>
                    <optgroup label="Legal States">
                      {LEGAL_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Restricted States">
                      {RESTRICTED_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other States">
                      {[
                        'Alabama', 'Alaska', 'California', 'Florida', 'Georgia',
                        'Hawaii', 'Idaho', 'Kansas', 'Kentucky', 'Maine', 
                        'Minnesota', 'Missouri', 'Nebraska', 'New Mexico', 'North Carolina',
                        'Ohio', 'Oklahoma', 'South Carolina', 'Texas', 'Utah',
                        'Vermont', 'Wisconsin'
                      ].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                {state && (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{state}</h4>
                      {LEGAL_STATES.includes(state) ? (
                        <Badge className="bg-green-500">Legal</Badge>
                      ) : RESTRICTED_STATES.includes(state) ? (
                        <Badge className="bg-yellow-500">Restricted</Badge>
                      ) : (
                        <Badge className="bg-red-500">Not Legal</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm">
                      {LEGAL_STATES.includes(state) ? (
                        <>Online sports betting is legal in {state}. You can participate in all features of the platform, including head-to-head real money betting.</>
                      ) : RESTRICTED_STATES.includes(state) ? (
                        <>{state} has specific restrictions for online sports betting. Some features may be limited to WeParlay Cash only. Please check your local regulations.</>
                      ) : (
                        <>Online sports betting is not currently legal in {state}. You can only use WeParlay Cash for betting on the platform.</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Info className="h-4 w-4" />
            <AlertTitle>Legal Information</AlertTitle>
            <AlertDescription>
              WeParlay operates in compliance with federal and state regulations. We continuously monitor legal changes across jurisdictions to ensure compliance.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="responsible" className="space-y-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20">
              <h3 className="text-lg font-semibold flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Responsible Gaming Commitment
              </h3>
              <p className="mt-2">
                WeParlay is committed to promoting responsible gaming practices. We provide tools and resources to help users maintain control over their betting activities.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Deposit Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Set daily, weekly, or monthly deposit limits to manage your spending and keep betting enjoyable.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Self-Exclusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Temporarily suspend your account for a period of your choosing if you need a break from betting.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Monitor your betting history, time spent, and patterns to stay aware of your habits.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Support Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Access to helplines and resources for those who may be concerned about their gambling behavior.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Problem Gambling Help</AlertTitle>
              <AlertDescription>
                If you or someone you know may have a gambling problem, call 1-800-GAMBLER for confidential help 24/7.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="age-confirmation" 
            checked={age} 
            onCheckedChange={(checked) => setAge(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="age-confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm I am 21 years of age or older
            </Label>
            <p className="text-sm text-muted-foreground">
              You must be 21 or older to use real money betting features on this platform.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          By clicking "I Accept", you acknowledge that you have read and agree to our Terms of Service, Privacy Policy, and Responsible Gaming policies.
        </div>
      </div>
    </div>
  );
  
  if (mode === 'inline') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Legal Terms & Conditions</CardTitle>
          <CardDescription>
            Please review and accept our terms before continuing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disclaimerContent}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleAccept}>I Accept</Button>
        </CardFooter>
      </Card>
    );
  } else if (mode === 'minimal') {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Legal Requirements</AlertTitle>
          <AlertDescription>
            You must be 21+ and in a state where online betting is legal to use real money features.
            <div className="mt-2">
              <Button variant="outline" size="sm" className="mr-2" onClick={() => setShowDialog(true)}>
                View Full Terms
              </Button>
              <Button size="sm" onClick={handleAccept}>
                <CheckCircle className="mr-2 h-4 w-4" /> I Accept
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>WeParlay Legal Terms</DialogTitle>
              <DialogDescription>
                Please review our terms and confirm your eligibility
              </DialogDescription>
            </DialogHeader>
            {disclaimerContent}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAccept}>
                I Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || <Button>Terms & Conditions</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>WeParlay Legal Terms</DialogTitle>
          <DialogDescription>
            Please review our terms and confirm your eligibility
          </DialogDescription>
        </DialogHeader>
        {disclaimerContent}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept}>
            I Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDisclaimer;