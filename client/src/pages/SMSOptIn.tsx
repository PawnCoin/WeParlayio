import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Bell } from "lucide-react";

const SMSOptIn: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">WeParlay SMS Notifications</h1>
          <p className="text-slate-300">Manage your SMS preferences for betting alerts and notifications</p>
        </div>

        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Phone className="h-5 w-5 text-cyan-400" />
              SMS Opt-In / Opt-Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOptIn} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">Include country code (e.g., +1 for US)</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                  />
                  <label htmlFor="consent" className="text-sm text-slate-300 leading-relaxed">
                    <strong>I consent to receive SMS messages</strong> from WeParlay regarding:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                      <li>Bet confirmations and results</li>
                      <li>Account security alerts</li>
                      <li>Important platform updates</li>
                      <li>Payment and withdrawal notifications</li>
                    </ul>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                  />
                  <label htmlFor="marketing" className="text-sm text-slate-300 leading-relaxed">
                    I also consent to receive promotional SMS messages including:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                      <li>Special betting offers and bonuses</li>
                      <li>New feature announcements</li>
                      <li>Sports betting tips and insights</li>
                    </ul>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !phoneNumber || !consent}
                  className="flex-1"
                >
                  {isSubmitting ? "Processing..." : "Opt In to SMS"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleOptOut}
                  disabled={!phoneNumber}
                  className="flex-1"
                >
                  Opt Out of SMS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              SMS Terms & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <h4 className="font-semibold mb-2">Message Frequency</h4>
              <p>You may receive up to 10 messages per day for transactional notifications and up to 3 promotional messages per week if opted in.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Standard Rates Apply</h4>
              <p>Message and data rates may apply. Contact your carrier for details about your messaging plan.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">How to Stop</h4>
              <p>You can opt out at any time by:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Replying "STOP" to any SMS from WeParlay</li>
                <li>Using the opt-out form above</li>
                <li>Contacting customer support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Help & Support</h4>
              <p>For help, reply "HELP" to any message or contact us at support@weparlay.io</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Privacy</h4>
              <p>Your phone number and SMS preferences are protected under our Privacy Policy. We never sell or share your personal information with third parties for marketing purposes.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              SMS Message Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Transactional Messages</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Bet placement confirmations</li>
                  <li>• Winning/losing bet notifications</li>
                  <li>• Account security alerts</li>
                  <li>• Password reset codes</li>
                  <li>• Withdrawal confirmations</li>
                  <li>• Account verification codes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Promotional Messages (Optional)</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Welcome bonuses and free bets</li>
                  <li>• Special event promotions</li>
                  <li>• VIP tier upgrade notifications</li>
                  <li>• New game and feature launches</li>
                  <li>• Seasonal betting contests</li>
                  <li>• Expert betting tips</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 pb-8">
          <p className="text-xs text-slate-500">
            WeParlay © 2025 | Compliant with TCPA, CAN-SPAM, and carrier guidelines
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMSOptIn;