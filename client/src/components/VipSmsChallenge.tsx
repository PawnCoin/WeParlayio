import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, MessageSquare, Phone, Mail, Zap, DollarSign, Clock, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface VipSmsChallengeProps {
  eventId?: string;
  eventName?: string;
  sport?: string;
  preselectedBet?: {
    team: string;
    odds: number;
    type: string;
  };
}

const VipSmsChallenge: React.FC<VipSmsChallengeProps> = ({
  eventId,
  eventName,
  sport,
  preselectedBet
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    opponentPhone: '',
    opponentEmail: '',
    challengeAmount: '25',
    customMessage: '',
    eventName: eventName || '',
    myPick: preselectedBet?.team || '',
    myOdds: preselectedBet?.odds || 0,
    betType: preselectedBet?.type || 'moneyline',
    expiryHours: '24',
    sendSms: true,
    sendEmail: true,
    isVirtual: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeCreated, setChallengeCreated] = useState<any>(null);
  const [smsConsent, setSmsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Check if user is VIP (using tier field from user schema)
  const isVip = user?.tier === 'gold' || user?.tier === 'platinum';

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Add +1 if US number without country code
    if (phone.length === 10 && !phone.startsWith('+')) {
      return `+1${phone}`;
    }
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  const handleSubmitChallenge = async () => {
    if (!formData.opponentPhone && !formData.opponentEmail) {
      toast({
        title: "Contact Required",
        description: "Please provide either a phone number or email for your opponent.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.eventName || !formData.myPick) {
      toast({
        title: "Bet Details Required",
        description: "Please specify the event and your pick.",
        variant: "destructive"
      });
      return;
    }

    // Check consent requirements
    if (formData.sendSms && isVip && !smsConsent) {
      setShowConsentModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const challengeData = {
        eventId,
        eventName: formData.eventName,
        amount: parseFloat(formData.challengeAmount),
        currency: 'USD',
        isVirtual: formData.isVirtual,
        pick: formData.myPick,
        odds: formData.myOdds,
        betType: formData.betType,
        customMessage: formData.customMessage,
        expiresAt: new Date(Date.now() + parseInt(formData.expiryHours) * 60 * 60 * 1000).toISOString(),

        // Contact information
        notificationPhone: formData.opponentPhone ? formatPhoneNumber(formData.opponentPhone) : null,
        notificationEmail: formData.opponentEmail || null,

        // Notification preferences
        sendSms: formData.sendSms && isVip && smsConsent, // Only VIP can send SMS with consent
        sendEmail: formData.sendEmail,
        smsConsent: smsConsent, // Track SMS consent
        marketingConsent: marketingConsent // Track marketing consent
      };

      const response = await apiRequest('POST', '/api/challenges/sms', challengeData);

      setChallengeCreated(response);

      toast({
        title: "Challenge Sent! 🎯",
        description: `Your ${formData.isVirtual ? 'WeParlay Cash' : 'real money'} challenge has been sent${formData.sendSms && isVip ? ' via SMS and email' : ' via email'}.`
      });

      // Reset form
      setFormData({
        ...formData,
        opponentPhone: '',
        opponentEmail: '',
        customMessage: ''
      });

    } catch (error: any) {
      console.error('Challenge creation error:', error);
      toast({
        title: "Challenge Failed",
        description: error.message || "Failed to send challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeCreated) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Challenge Sent Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your challenge has been sent to your opponent. They'll receive notifications and can accept or decline.
          </p>
          <div className="bg-muted p-3 rounded-lg mb-4">
            <p className="text-sm"><strong>Challenge ID:</strong> {challengeCreated.challengeUuid}</p>
            <p className="text-sm"><strong>Amount:</strong> ${challengeCreated.amount} {challengeCreated.isVirtual ? 'WeParlay Cash' : 'Real Money'}</p>
            <p className="text-sm"><strong>Expires:</strong> {new Date(challengeCreated.expiresAt).toLocaleDateString()}</p>
          </div>
          <Button onClick={() => setChallengeCreated(null)} className="w-full">
            Send Another Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isVip ? (
            <Crown className="h-5 w-5 text-yellow-500" />
          ) : (
            <Zap className="h-5 w-5 text-blue-500" />
          )}
          <CardTitle>
            {isVip ? 'VIP SMS Challenge' : 'Email Challenge'}
          </CardTitle>
          {isVip && <Badge className="bg-yellow-500 text-white">VIP</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          {isVip 
            ? "Send instant SMS + email challenges to your friends"
            : "Send email challenges (upgrade to VIP for SMS notifications)"
          }
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Information */}
        <div className="space-y-3">
          <Label htmlFor="eventName">Event/Game</Label>
          <Input
            id="eventName"
            value={formData.eventName}
            onChange={(e) => handleInputChange('eventName', e.target.value)}
            placeholder="e.g., Lakers vs Warriors"
          />
        </div>

        {/* Bet Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="myPick">Your Pick</Label>
            <Input
              id="myPick"
              value={formData.myPick}
              onChange={(e) => handleInputChange('myPick', e.target.value)}
              placeholder="e.g., Lakers"
            />
          </div>
          <div>
            <Label htmlFor="challengeAmount">Amount ($)</Label>
            <Input
              id="challengeAmount"
              type="number"
              min="5"
              value={formData.challengeAmount}
              onChange={(e) => handleInputChange('challengeAmount', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Opponent Contact */}
        <div className="space-y-3">
          <Label>Opponent Contact Information</Label>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isVip ? "Phone number (for SMS)" : "Phone number (VIP feature)"}
                value={formData.opponentPhone}
                onChange={(e) => handleInputChange('opponentPhone', e.target.value)}
                disabled={!isVip}
              />
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Email address"
                type="email"
                value={formData.opponentEmail}
                onChange={(e) => handleInputChange('opponentEmail', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notification Options */}
        {isVip && (
          <div className="space-y-3">
            <Label>Notification Methods</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Send SMS</span>
                <Badge variant="outline" className="text-xs">VIP</Badge>
              </div>
              <Switch
                checked={formData.sendSms}
                onCheckedChange={(checked) => handleInputChange('sendSms', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Send Email</span>
              </div>
              <Switch
                checked={formData.sendEmail}
                onCheckedChange={(checked) => handleInputChange('sendEmail', checked)}
              />
            </div>
          </div>
        )}

        {/* Money Type */}
        <div className="space-y-3">
          <Label>Bet Type</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">
                {formData.isVirtual ? 'WeParlay Cash' : 'Real Money'}
              </span>
            </div>
            <Switch
              checked={!formData.isVirtual}
              onCheckedChange={(checked) => handleInputChange('isVirtual', !checked)}
            />
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label htmlFor="customMessage">Custom Message (Optional)</Label>
          <Textarea
            id="customMessage"
            placeholder="Add a personal message to your challenge..."
            value={formData.customMessage}
            onChange={(e) => handleInputChange('customMessage', e.target.value)}
            rows={3}
          />
        </div>

        {/* Expiry */}
        <div className="space-y-2">
          <Label htmlFor="expiryHours">Challenge Expires In</Label>
          <Select value={formData.expiryHours} onValueChange={(value) => handleInputChange('expiryHours', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="6">6 hours</SelectItem>
              <SelectItem value="12">12 hours</SelectItem>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="48">2 days</SelectItem>
              <SelectItem value="168">1 week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* VIP Upgrade Notice */}
        {!isVip && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Crown className="h-4 w-4" />
              <span className="font-medium text-sm">Upgrade to VIP for SMS Challenges</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Get instant SMS notifications for head-to-head challenges with Gold or Platinum membership.
            </p>
          </div>
        )}

         {/* Consent Section */}
         {isVip && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">SMS & Communication Consent</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="sms-consent"
                    checked={smsConsent}
                    onCheckedChange={setSmsConsent}
                  />
                  <Label htmlFor="sms-consent" className="text-sm text-blue-800">
                    I consent to sending SMS challenges to my friends and understand that standard message rates may apply.
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={setMarketingConsent}
                  />
                  <Label htmlFor="marketing-consent" className="text-sm text-blue-800">
                    I agree to receive promotional SMS messages about WeParlay features (optional).
                  </Label>
                </div>
              </div>
              <p className="text-xs text-blue-600">
                We respect your privacy. You can update these preferences anytime in your account settings.
              </p>
            </div>
          )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitChallenge}
          disabled={isSubmitting || (isVip && formData.sendSms && !smsConsent)}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            "Sending Challenge..."
          ) : (
            <>
              {isVip ? (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS + Email Challenge
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Challenge
                </>
              )}
            </>
          )}
        </Button>
      </CardContent>

       {/* Consent Modal */}
       {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                SMS Consent Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Before sending SMS challenges, we need your consent to send text messages on your behalf.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="modal-sms-consent"
                    checked={smsConsent}
                    onCheckedChange={setSmsConsent}
                  />
                  <Label htmlFor="modal-sms-consent" className="text-sm">
                    I consent to sending SMS challenges to my friends. Standard message rates may apply.
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="modal-marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={setMarketingConsent}
                  />
                  <Label htmlFor="modal-marketing-consent" className="text-sm">
                    I agree to receive promotional SMS messages (optional).
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowConsentModal(false);
                    handleSubmitChallenge();
                  }}
                  disabled={!smsConsent}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default VipSmsChallenge;