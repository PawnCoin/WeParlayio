import React from 'react';
import { useSearchParams } from 'wouter';
import VipSmsChallenge from '@/components/VipSmsChallenge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Crown } from 'lucide-react';

export default function SmsChallengePage() {
  const [searchParams] = useSearchParams();
  
  // Get URL parameters for pre-filled challenge data
  const eventId = searchParams.get('eventId');
  const eventName = searchParams.get('eventName');
  const sport = searchParams.get('sport');
  const team = searchParams.get('team');
  const odds = searchParams.get('odds');
  const betType = searchParams.get('betType');

  const preselectedBet = (team && odds) ? {
    team,
    odds: parseFloat(odds),
    type: betType || 'moneyline'
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              SMS Challenge Center
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Challenge your friends instantly with SMS notifications! VIP members get instant SMS delivery, 
            while all users can send email challenges.
          </p>
        </div>

        {/* Main Challenge Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VipSmsChallenge 
              eventId={eventId || undefined}
              eventName={eventName || undefined}
              sport={sport || undefined}
              preselectedBet={preselectedBet}
            />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  VIP SMS Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Instant SMS Delivery</p>
                    <p className="text-sm text-muted-foreground">Your challenges arrive instantly via text message</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Higher Engagement</p>
                    <p className="text-sm text-muted-foreground">Friends are 3x more likely to see SMS vs email</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Real-Time Notifications</p>
                    <p className="text-sm text-muted-foreground">Get immediate responses to your challenges</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">1</div>
                  <div>
                    <p className="font-medium">Create Challenge</p>
                    <p className="text-sm text-muted-foreground">Set your bet details and amount</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">2</div>
                  <div>
                    <p className="font-medium">Add Friend's Contact</p>
                    <p className="text-sm text-muted-foreground">Phone number (VIP) or email address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">3</div>
                  <div>
                    <p className="font-medium">Send & Track</p>
                    <p className="text-sm text-muted-foreground">Instant delivery with acceptance tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}