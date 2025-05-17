import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Check, AlertTriangle, Info, Shield, ExternalLink } from 'lucide-react';
import LegalDisclaimer from '@/components/compliance/LegalDisclaimer';

interface BettingComplianceProps {
  isRealMoney: boolean;
  amount?: number;
  onComplianceVerified?: (isVerified: boolean) => void;
  showRules?: boolean;
}

const BettingCompliance: React.FC<BettingComplianceProps> = ({
  isRealMoney,
  amount = 0,
  onComplianceVerified,
  showRules = true
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [userState, setUserState] = useState<string | null>(null);
  const [isLegalState, setIsLegalState] = useState<boolean>(true);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [complianceChecks, setComplianceChecks] = useState({
    age: false,
    location: false,
    terms: false,
    funds: false
  });
  
  // List of states where betting is legal
  const legalStates = [
    'Nevada', 'New Jersey', 'Pennsylvania', 'Michigan', 'Illinois', 
    'Colorado', 'Indiana', 'Iowa', 'New Hampshire', 'Rhode Island', 
    'Tennessee', 'Virginia', 'West Virginia', 'Arizona', 'Wyoming',
    'Connecticut', 'Louisiana', 'Maryland', 'New York', 'Oregon'
  ];
  
  useEffect(() => {
    // Check for stored legal acceptance
    const legalAccepted = localStorage.getItem('weparlay_legal_accepted') === 'true';
    const storedState = localStorage.getItem('weparlay_user_state');
    
    setTermsAccepted(legalAccepted);
    setUserState(storedState);
    
    // Determine if the user is in a legal betting state
    if (storedState) {
      setIsLegalState(legalStates.includes(storedState));
    }
    
    // Run compliance checks
    const ageVerified = legalAccepted; // Age is verified during legal acceptance
    const locationVerified = isRealMoney ? (storedState ? legalStates.includes(storedState) : false) : true;
    const termsVerified = legalAccepted;
    const fundsVerified = isRealMoney ? (user?.balance || 0) >= amount : true;
    
    setComplianceChecks({
      age: ageVerified,
      location: locationVerified,
      terms: termsVerified,
      funds: fundsVerified
    });
    
    // Notify parent component if all checks passed
    const allChecksPass = ageVerified && locationVerified && termsVerified && fundsVerified;
    if (onComplianceVerified) {
      onComplianceVerified(allChecksPass);
    }
    
    // Show legal terms if not already accepted and this is real money
    if (isRealMoney && !legalAccepted) {
      setShowTerms(true);
    }
  }, [isRealMoney, amount, user]);
  
  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setComplianceChecks(prev => ({ ...prev, terms: true }));
    setShowTerms(false);
    
    // Check if all requirements are now met
    const updatedChecks = {
      ...complianceChecks,
      terms: true
    };
    
    const allChecksPass = 
      updatedChecks.age && 
      updatedChecks.location && 
      updatedChecks.terms && 
      updatedChecks.funds;
      
    if (onComplianceVerified) {
      onComplianceVerified(allChecksPass);
    }
  };
  
  if (!isRealMoney && !showRules) {
    return null; // Don't show compliance for play money unless requested
  }
  
  return (
    <>
      {/* Show compact compliance summary */}
      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center">
            <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            {isRealMoney ? "Real Money Betting Rules" : "WeParlay Cash Betting"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="py-2">
          <div className="space-y-3">
            {/* Age Verification */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Age Verification (21+)</span>
              {complianceChecks.age ? (
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <Check className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Required
                </Badge>
              )}
            </div>
            
            {/* Location Verification */}
            {isRealMoney && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Location Compliance</span>
                {complianceChecks.location ? (
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <Check className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Restricted
                  </Badge>
                )}
              </div>
            )}
            
            {/* Terms Acceptance */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Terms Acceptance</span>
              {complianceChecks.terms ? (
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <Check className="h-3 w-3 mr-1" /> Accepted
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Required
                </Badge>
              )}
            </div>
            
            {/* Sufficient Funds */}
            {isRealMoney && amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Sufficient Funds</span>
                {complianceChecks.funds ? (
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <Check className="h-3 w-3 mr-1" /> Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Insufficient
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {!isLegalState && isRealMoney && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Geographic Restriction</AlertTitle>
              <AlertDescription>
                {userState ? 
                  `Online betting is not permitted in ${userState}. You can only use WeParlay Cash.` : 
                  'Your location does not permit real money betting. You can only use WeParlay Cash.'}
              </AlertDescription>
            </Alert>
          )}
          
          {!complianceChecks.terms && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTerms(true)}
                className="w-full"
              >
                Review and Accept Terms
              </Button>
            </div>
          )}
        </CardContent>
        
        {showRules && (
          <CardFooter className="pt-0 pb-3">
            <div className="w-full text-xs text-muted-foreground border-t pt-3">
              <p>
                {isRealMoney ? 
                  'Real money betting requires age and location verification per US regulations.' : 
                  'WeParlay Cash is virtual currency with no real-world value used for entertainment purposes only.'}
              </p>
              <a 
                href="#" 
                className="text-blue-600 dark:text-blue-400 inline-flex items-center mt-1 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Full Terms
              </a>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Legal Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>WeParlay Legal Terms</DialogTitle>
            <DialogDescription>
              Please review our terms and confirm your eligibility
            </DialogDescription>
          </DialogHeader>
          
          <LegalDisclaimer 
            mode="dialog" 
            onAccept={handleAcceptTerms} 
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerms(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptTerms}>
              I Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BettingCompliance;