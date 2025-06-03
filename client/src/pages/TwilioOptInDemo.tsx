import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Phone, 
  MessageSquare, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Clock,
  Users,
  Zap
} from "lucide-react";

export default function TwilioOptInDemo() {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [optInStep, setOptInStep] = useState(1);

  // Consumer SMS Opt-in Process
  const optInMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sms/consumer-opt-in", data);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Opt-in Recorded",
        description: "Your consent has been properly documented for Twilio compliance.",
      });
      setOptInStep(2);
    },
    onError: (error: any) => {
      toast({
        title: "Opt-in Failed",
        description: error.message || "Failed to record SMS consent",
        variant: "destructive",
      });
    },
  });

  // Send verification SMS
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sms/send-verification", {
        phoneNumber,
        messageType: "verification"
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Verification Sent",
        description: "Please check your phone for the verification code.",
      });
      setOptInStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send verification SMS",
        variant: "destructive",
      });
    },
  });

  // Verify SMS code
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/sms/verify-code", {
        phoneNumber,
        code
      });
      return response;
    },
    onSuccess: () => {
      setIsVerified(true);
      setOptInStep(4);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const handleOptIn = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!smsConsent) {
      toast({
        title: "SMS Consent Required",
        description: "You must consent to receive SMS messages",
        variant: "destructive",
      });
      return;
    }

    optInMutation.mutate({
      phoneNumber,
      smsConsent,
      marketingConsent,
      emailConsent,
      timestamp: new Date().toISOString(),
      ipAddress: "user_ip_recorded",
      userAgent: navigator.userAgent,
      consentMethod: "website_form",
      complianceNote: "Double opt-in process with explicit SMS consent"
    });
  };

  const handleSendVerification = () => {
    sendVerificationMutation.mutate();
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate(verificationCode);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Twilio SMS Opt-in Demonstration
        </h1>
        <p className="text-muted-foreground">
          Complete consumer consent process for SMS messaging compliance
        </p>
        <Badge variant="outline" className="text-sm">
          Twilio Verification Required
        </Badge>
      </div>

      <Tabs defaultValue="opt-in" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opt-in">Consumer Opt-in</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Features</TabsTrigger>
          <TabsTrigger value="records">Consent Records</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* Consumer Opt-in Process */}
        <TabsContent value="opt-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opt-in Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  SMS Consent Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step 1: Consent Collection */}
                {optInStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>SMS Messaging Consent:</strong> By providing your phone number and checking the box below, 
                        you explicitly consent to receive SMS messages from WeParlay.io including bet alerts, 
                        promotional offers, and account notifications. Message and data rates may apply.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms-consent"
                          checked={smsConsent}
                          onCheckedChange={(checked) => setSmsConsent(checked as boolean)}
                        />
                        <Label htmlFor="sms-consent" className="text-sm font-medium">
                          I consent to receive SMS messages from WeParlay.io (Required)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing-consent"
                          checked={marketingConsent}
                          onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                        />
                        <Label htmlFor="marketing-consent" className="text-sm">
                          I consent to receive marketing SMS messages (Optional)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email-consent"
                          checked={emailConsent}
                          onCheckedChange={(checked) => setEmailConsent(checked as boolean)}
                        />
                        <Label htmlFor="email-consent" className="text-sm">
                          I consent to receive email communications (Optional)
                        </Label>
                      </div>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        You can opt-out at any time by replying STOP to any SMS message. 
                        For help, reply HELP. Terms and privacy policy apply.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleOptIn} 
                      disabled={optInMutation.isPending || !smsConsent}
                      className="w-full"
                    >
                      {optInMutation.isPending ? "Recording Consent..." : "Submit Consent"}
                    </Button>
                  </div>
                )}

                {/* Step 2: Verification Trigger */}
                {optInStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Consent Recorded</h3>
                      <p className="text-sm text-muted-foreground">
                        Your SMS consent has been properly documented
                      </p>
                    </div>

                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        Now we'll send a verification SMS to <strong>{phoneNumber}</strong> to confirm 
                        your number and complete the double opt-in process.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleSendVerification} 
                      disabled={sendVerificationMutation.isPending}
                      className="w-full"
                    >
                      {sendVerificationMutation.isPending ? "Sending..." : "Send Verification SMS"}
                    </Button>
                  </div>
                )}

                {/* Step 3: Code Verification */}
                {optInStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Verification Sent</h3>
                      <p className="text-sm text-muted-foreground">
                        Check your phone for the verification code
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>

                    <Button 
                      onClick={handleVerifyCode} 
                      disabled={verifyCodeMutation.isPending}
                      className="w-full"
                    >
                      {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                )}

                {/* Step 4: Complete */}
                {optInStep === 4 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">SMS Setup Complete</h3>
                      <p className="text-sm text-muted-foreground">
                        Your phone is verified and SMS notifications are active
                      </p>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Compliance Complete:</strong> Your explicit consent and phone verification 
                        have been recorded according to Twilio and TCPA requirements.
                      </AlertDescription>
                    </Alert>

                    <Badge variant="default" className="w-full justify-center py-2">
                      Twilio Compliant SMS Setup ✓
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Opt-in Process Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${optInStep >= 1 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${optInStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>1</div>
                    <div>
                      <p className="font-medium">Explicit Consent Collection</p>
                      <p className="text-sm opacity-75">User provides phone number and checks SMS consent box</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${optInStep >= 2 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${optInStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>2</div>
                    <div>
                      <p className="font-medium">Consent Documentation</p>
                      <p className="text-sm opacity-75">Timestamp, IP address, and user agent recorded</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${optInStep >= 3 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${optInStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>3</div>
                    <div>
                      <p className="font-medium">Double Opt-in Verification</p>
                      <p className="text-sm opacity-75">SMS verification code sent to confirm number</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${optInStep >= 4 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${optInStep >= 4 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>4</div>
                    <div>
                      <p className="font-medium">Verification Complete</p>
                      <p className="text-sm opacity-75">Phone verified and SMS subscription active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Features */}
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  TCPA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Explicit written consent required
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Clear opt-out instructions provided
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Double opt-in verification process
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Consent timestamp recording
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    IP address tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    User agent recording
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Consent method documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Immutable consent logs
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Easy opt-out via STOP
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Help command support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Consent withdrawal tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Data export capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consent Records */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Consent Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <pre>{`{
  "userId": "user_12345",
  "phoneNumber": "+15551234567",
  "consentType": "sms_marketing",
  "consentStatus": "granted",
  "consentMethod": "website_form",
  "timestamp": "2025-06-03T05:00:00.000Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "doubleOptIn": true,
  "verificationSent": "2025-06-03T05:01:00.000Z",
  "verificationConfirmed": "2025-06-03T05:02:15.000Z",
  "complianceNotes": [
    "Explicit consent checkbox selected",
    "TCPA disclosure provided",
    "Double opt-in completed",
    "Opt-out instructions given"
  ],
  "consentText": "I consent to receive SMS messages from WeParlay.io including bet alerts, promotional offers, and account notifications. Message and data rates may apply. Reply STOP to opt-out.",
  "auditLog": [
    {
      "action": "consent_granted",
      "timestamp": "2025-06-03T05:00:00.000Z",
      "details": "User checked SMS consent checkbox"
    },
    {
      "action": "verification_sent",
      "timestamp": "2025-06-03T05:01:00.000Z",
      "details": "SMS verification code sent"
    },
    {
      "action": "verification_confirmed",
      "timestamp": "2025-06-03T05:02:15.000Z",
      "details": "User entered correct verification code"
    }
  ]
}`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="documentation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Twilio SMS Compliance Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Explicit Consent Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    Users must actively consent to receive SMS messages through a clear opt-in process. 
                    Pre-checked boxes or implied consent are not sufficient.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Double Opt-in Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    After initial consent, send a verification SMS to confirm the phone number belongs 
                    to the person who provided consent.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Clear Opt-out Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    Every message must include clear instructions on how to opt-out (typically "Reply STOP to opt-out").
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Consent Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Maintain detailed records of when, how, and where consent was obtained, including timestamps, 
                    IP addresses, and the exact consent language used.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5. Message Content Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    Only send messages that users have specifically consented to receive. Separate consent 
                    may be required for different message types (transactional vs. promotional).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>For Twilio Review:</strong> This demonstration shows our complete SMS opt-in process 
                including explicit consent collection, double opt-in verification, consent documentation, 
                and compliance with TCPA requirements. All consent records are maintained with full audit trails.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}