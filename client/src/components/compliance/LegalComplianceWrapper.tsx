import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import LegalDisclaimer from './LegalDisclaimer';

interface LegalComplianceWrapperProps {
  children: React.ReactNode;
  enforceCompliance?: boolean;
  showAlert?: boolean;
}

const LegalComplianceWrapper: React.FC<LegalComplianceWrapperProps> = ({
  children,
  enforceCompliance = true,
  showAlert = true
}) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userState, setUserState] = useState<string | null>(null);
  const [isLegalState, setIsLegalState] = useState<boolean>(true);
  
  useEffect(() => {
    // Check for stored legal acceptance
    const legalAccepted = localStorage.getItem('weparlay_legal_accepted') === 'true';
    const storedState = localStorage.getItem('weparlay_user_state');
    
    setHasAcceptedTerms(legalAccepted);
    setUserState(storedState);
    
    // Determine if the user is in a legal betting state
    if (storedState) {
      const legalStates = [
        'Nevada', 'New Jersey', 'Pennsylvania', 'Michigan', 'Illinois', 
        'Colorado', 'Indiana', 'Iowa', 'New Hampshire', 'Rhode Island', 
        'Tennessee', 'Virginia', 'West Virginia', 'Arizona', 'Wyoming',
        'Connecticut', 'Louisiana', 'Maryland', 'New York', 'Oregon'
      ];
      
      setIsLegalState(legalStates.includes(storedState));
    }
    
    setIsLoading(false);
  }, []);
  
  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
  };
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  // If terms not accepted and compliance is enforced, show the disclaimer
  if (!hasAcceptedTerms && enforceCompliance) {
    return (
      <div className="space-y-6">
        {showAlert && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Legal Terms Required</AlertTitle>
            <AlertDescription>
              You must accept our terms and confirm your eligibility before accessing betting features.
            </AlertDescription>
          </Alert>
        )}
        
        <LegalDisclaimer 
          mode="inline" 
          onAccept={handleAcceptTerms} 
        />
      </div>
    );
  }
  
  // If in an illegal state and real money betting is restricted
  if (userState && !isLegalState && enforceCompliance) {
    return (
      <div className="space-y-6">
        {children}
        
        {showAlert && (
          <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Geographic Restriction</AlertTitle>
            <AlertDescription>
              Online betting is not permitted in {userState}. You can only use WeParlay Cash for betting activities.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
  
  // All checks passed, render children
  return <>{children}</>;
};

export default LegalComplianceWrapper;