import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NotificationTest() {
  const [emailType, setEmailType] = useState("welcome");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsType, setSmsType] = useState("bet");
  const [isEmailTesting, setIsEmailTesting] = useState(false);
  const [isSMSTesting, setIsSMSTesting] = useState(false);
  const { toast } = useToast();

  const testEmail = async () => {
    setIsEmailTesting(true);
    try {
      const response = await apiRequest("POST", "/api/notifications/test-email", {
        type: emailType
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.success ? "Email Test Successful ✅" : "Email Test Failed ❌",
          description: data.message,
          variant: data.success ? "default" : "destructive"
        });
      } else {
        throw new Error("Failed to test email");
      }
    } catch (error) {
      toast({
        title: "Email Test Failed ❌",
        description: "Unable to send test email. Check your SMTP configuration.",
        variant: "destructive"
      });
    } finally {
      setIsEmailTesting(false);
    }
  };

  const testSMS = async () => {
    if (!smsPhone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to test SMS",
        variant: "destructive"
      });
      return;
    }

    setIsSMSTesting(true);
    try {
      const response = await apiRequest("POST", "/api/notifications/test-sms", {
        phone: smsPhone,
        type: smsType
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.success ? "SMS Test Successful ✅" : "SMS Test Failed ❌",
          description: data.message,
          variant: data.success ? "default" : "destructive"
        });
      } else {
        throw new Error("Failed to test SMS");
      }
    } catch (error) {
      toast({
        title: "SMS Test Failed ❌",
        description: "Unable to send test SMS. Check your Twilio configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSMSTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            📧 Notification System Test
          </h1>
          <p className="text-blue-200 text-lg">
            Test your email and SMS notification system to ensure everything is working properly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Testing Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📧 Email Testing
              </CardTitle>
              <CardDescription className="text-slate-300">
                Test email notifications using Hostinger SMTP (support@weparlay.io)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Email Template Type
                </label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="bet">Bet Confirmation</SelectItem>
                    <SelectItem value="win">Win Notification</SelectItem>
                    <SelectItem value="security">Security Alert</SelectItem>
                    <SelectItem value="test">Basic Test Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={testEmail} 
                disabled={isEmailTesting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isEmailTesting ? "Sending..." : "Send Test Email"}
              </Button>

              <div className="text-xs text-slate-400 space-y-1">
                <p>✓ SMTP Server: smtp.hostinger.com:465 (SSL)</p>
                <p>✓ From: support@weparlay.io</p>
                <p>✓ To: test@example.com (for testing)</p>
              </div>
            </CardContent>
          </Card>

          {/* SMS Testing Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📱 SMS Testing
              </CardTitle>
              <CardDescription className="text-slate-300">
                Test SMS notifications using Twilio integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Your Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  SMS Template Type
                </label>
                <Select value={smsType} onValueChange={setSmsType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="bet">Bet Confirmation</SelectItem>
                    <SelectItem value="win">Win Notification</SelectItem>
                    <SelectItem value="security">Security Alert</SelectItem>
                    <SelectItem value="test">Basic Test SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={testSMS} 
                disabled={isSMSTesting || !smsPhone}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSMSTesting ? "Sending..." : "Send Test SMS"}
              </Button>

              <div className="text-xs text-slate-400 space-y-1">
                <p>✓ Provider: Twilio</p>
                <p>✓ From: WeParlay verified number</p>
                <p>⚠️ SMS charges may apply (~$0.0075 per message)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🔧 Integration Status</CardTitle>
            <CardDescription className="text-slate-300">
              Current configuration and what happens automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Automatic Email Notifications:</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✅ Welcome emails for new users</li>
                  <li>✅ Bet confirmation emails</li>
                  <li>✅ Win/loss notifications</li>
                  <li>✅ Security alerts for account activity</li>
                  <li>✅ Admin alerts for platform issues</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Automatic SMS Notifications:</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✅ Bet confirmations (optional)</li>
                  <li>✅ Win notifications</li>
                  <li>✅ Security alerts</li>
                  <li>✅ Withdrawal confirmations</li>
                  <li>ℹ️ Users can opt-in/out in settings</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h4 className="font-semibold text-blue-200 mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-blue-100">
                These notifications will automatically trigger when users place bets, win/lose, 
                create accounts, or when security events occur. No manual intervention needed!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}