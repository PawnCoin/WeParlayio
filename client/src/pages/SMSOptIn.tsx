import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Bell, CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react";

const SMSOptIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !consent) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number and consent to receive SMS messages.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/sms/opt-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          consent,
          marketingConsent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "SMS Opt-In Successful",
          description: "You've successfully opted in to receive SMS notifications from WeParlay.",
        });
        setPhoneNumber("");
        setConsent(false);
        setMarketingConsent(false);
      } else {
        throw new Error('Failed to opt in');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your opt-in request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptOut = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to opt out.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/sms/opt-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "SMS Opt-Out Successful",
          description: "You've been removed from SMS notifications.",
        });
        setPhoneNumber("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your opt-out request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-4">
      <div className="max-w-3xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">WeParlay SMS Notifications</h1>
          <p className="text-gray-400 text-lg">Opt-In Disclosure & Consent</p>
          <Badge variant="outline" className="mt-4 border-blue-500/50 text-blue-400 px-4 py-1">
            <Shield className="w-3 h-3 mr-2" />
            TCPA Compliant
          </Badge>
        </div>

        {/* Opt-In Form */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Phone className="h-5 w-5 text-blue-400" />
              SMS Opt-In / Opt-Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOptIn} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +1 for US)</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                  />
                  <label htmlFor="consent" className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white">I consent to receive SMS messages</strong> from WeParlay regarding:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                      <li>Account verification and security codes</li>
                      <li>Bet confirmations and results</li>
                      <li>Head-to-head betting challenge notifications</li>
                      <li>Payment and withdrawal notifications</li>
                      <li>Important platform updates</li>
                    </ul>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                  />
                  <label htmlFor="marketing" className="text-sm text-gray-300 leading-relaxed">
                    I also consent to receive <strong className="text-white">promotional SMS messages</strong> including:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                      <li>Special betting offers and bonuses</li>
                      <li>New feature announcements</li>
                      <li>Sports betting tips and insights</li>
                    </ul>
                  </label>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  By opting in, you acknowledge that you have read and agree to this SMS opt-in disclosure. 
                  Your consent is not a condition of any purchase. Message and data rates may apply.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !phoneNumber || !consent}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Processing..." : "Opt In to SMS"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleOptOut}
                  disabled={!phoneNumber}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Opt Out of SMS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* What You're Signing Up For */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              What You're Signing Up For
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              By providing your phone number and opting in, you consent to receive SMS text messages 
              from <strong className="text-white">WeParlay</strong> (weparlay.io). These messages may include:
            </p>
            <ul className="space-y-3">
              {[
                "Account verification and security codes",
                "Head-to-head betting challenge notifications",
                "Bet confirmation and settlement alerts",
                "Live score updates and game alerts",
                "Account activity and transaction notifications",
                "Promotional offers and platform updates (if opted in)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* How to Opt Out */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <XCircle className="h-5 w-5 text-red-400" />
              How to Opt Out (Stop Messages)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              You can opt out of receiving SMS messages from WeParlay at any time by using any of these methods:
            </p>
            <div className="bg-gray-900/60 border border-gray-600 rounded-lg p-5">
              <p className="text-white font-semibold mb-2">Reply with any of the following keywords:</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {["STOP", "CANCEL", "UNSUBSCRIBE", "QUIT", "END"].map((kw) => (
                  <Badge key={kw} className="bg-red-600/20 text-red-300 border border-red-500/30 px-3 py-1 font-mono text-sm">
                    {kw}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                You will receive a one-time confirmation message acknowledging your opt-out request. 
                No further messages will be sent unless you re-subscribe.
              </p>
            </div>
            <p>You may also opt out by:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gray-500">-</span>
                <span>Using the opt-out form above on this page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500">-</span>
                <span>Disabling SMS notifications in your account settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500">-</span>
                <span>Contacting our support team at support@weparlay.io</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Message Frequency & Rates */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Message Frequency & Data Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-1">Message Frequency</p>
                <p className="text-white font-semibold">Varies based on account activity</p>
                <p className="text-gray-400 text-xs mt-1">Transactional: Up to 10 messages per day. Promotional: Up to 3 messages per week (if opted in).</p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-1">Data Rates</p>
                <p className="text-white font-semibold">Message & data rates may apply</p>
                <p className="text-gray-400 text-xs mt-1">Standard messaging rates from your carrier apply. Check with your carrier for details.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Supported carriers include but are not limited to: AT&T, T-Mobile, Verizon, Sprint, and all major US carriers. 
              T-Mobile is not liable for delayed or undelivered messages.
            </p>
          </CardContent>
        </Card>

        {/* SMS Message Types */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-orange-400" />
              SMS Message Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-3">Transactional Messages</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Bet placement confirmations</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Winning/losing bet notifications</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Account security alerts & 2FA codes</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Password reset codes</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Withdrawal confirmations</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Account verification codes</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> Head-to-head challenge alerts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Promotional Messages (Optional)</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> Welcome bonuses and free bets</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> Special event promotions</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> VIP tier upgrade notifications</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> New game and feature launches</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> Seasonal betting contests</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" /> Expert betting tips</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Help */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-purple-400" />
              Privacy & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              Your phone number and personal information will never be sold or shared with third parties 
              for marketing purposes. We use your phone number solely for the purposes described in this disclosure.
            </p>
            <p>
              For more information, please review our{" "}
              <a href="/privacy-policy" className="text-blue-400 underline hover:text-blue-300">Privacy Policy</a>{" "}
              and{" "}
              <a href="/terms-of-service" className="text-blue-400 underline hover:text-blue-300">Terms of Service</a>.
            </p>
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-400 text-sm mb-1">Need Help?</p>
              <p className="text-white">Reply <span className="font-mono bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded">HELP</span> to any message for assistance</p>
              <p className="text-gray-400 text-sm mt-2">Or contact us at: <a href="mailto:support@weparlay.io" className="text-blue-400 underline">support@weparlay.io</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pb-8 space-y-2">
          <p className="text-gray-500 text-sm">WeParlay - weparlay.io</p>
          <p className="text-gray-500 text-xs">This page serves as the official SMS opt-in disclosure for WeParlay messaging services.</p>
          <p className="text-gray-600 text-xs">Compliant with TCPA, CAN-SPAM, and carrier guidelines</p>
          <p className="text-gray-600 text-xs">Last updated: February 2026</p>
        </div>
      </div>
    </div>
  );
};

export default SMSOptIn;
