import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import SocialShareOptions from '@/components/betting/SocialShareOptions';
import { 
  DollarSign,
  Mail,
  Phone,
  Send,
  Share,
  Copy,
  PlusCircle,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Trophy,
  Crown,
  Lock
} from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  eventId: z.string().optional(),
  customBet: z.string().optional(),
  challengeType: z.enum(["sports", "custom"]),
  contactMethod: z.enum(["email", "phone", "username"]),
  contactValue: z.string().min(1, "Contact information is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms"),
  currencyType: z.enum(["real", "virtual"]),
});

type FormValues = z.infer<typeof formSchema>;

interface HeadToHeadChallengeProps {
  defaultEvent?: any;
  defaultSelection?: any;
}

const HeadToHeadChallenge: React.FC<HeadToHeadChallengeProps> = ({ 
  defaultEvent,
  defaultSelection
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [challengeLink, setChallengeLink] = useState('');
  const [activeEvents, setActiveEvents] = useState([
    { id: '1', name: 'Los Angeles Lakers vs Golden State Warriors', date: '2023-05-19T19:30:00' },
    { id: '2', name: 'Boston Celtics vs Miami Heat', date: '2023-05-19T20:00:00' },
    { id: '3', name: 'Denver Nuggets vs Minnesota Timberwolves', date: '2023-05-20T21:00:00' },
  ]);

    // Check if user is VIP (Gold or Platinum)
    const isVip = user?.subscriptionTier === 'gold' || user?.subscriptionTier === 'platinum';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      eventId: defaultEvent?.id || '',
      customBet: '',
      challengeType: defaultEvent ? 'sports' : 'custom',
      contactMethod: 'email',
      contactValue: '',
      expiryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      notes: '',
      termsAccepted: false,
      currencyType: 'real', // Default to real money for head-to-head bets
    },
  });

  const watchChallengeType = form.watch('challengeType');
  const watchContactMethod = form.watch('contactMethod');

  const onSubmit = async (values: FormValues) => {
    setIsPending(true);

    try {
      // Create real challenge in database
      const challengeData = {
        eventName: values.eventSelection,
        amount: parseFloat(values.betAmount),
        currency: 'USD',
        isVirtual: values.betType === 'virtual',
        pick: values.yourPick,
        customMessage: values.message,
        inviteMethod: values.inviteMethod,
        friendEmail: values.friendEmail,
        friendPhone: values.friendPhone,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      const response = await apiRequest('POST', '/api/challenges', challengeData);

      if (response.ok) {
        const result = await response.json();
        const generatedLink = `https://weparlay.io/challenge/${result.challengeUuid}`;
        setChallengeLink(generatedLink);

        setShowConfirmation(true);

        toast({
          title: "Challenge created!",
          description: "Your head-to-head bet challenge has been sent successfully.",
        });
      } else {
        throw new Error('Failed to create challenge');
      }

    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Failed to create challenge",
        description: error.message || "There was an error creating your challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Challenge link has been copied to your clipboard.",
    });
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication required</AlertTitle>
        <AlertDescription>
          You need to be logged in to create head-to-head bet challenges.
        </AlertDescription>
      </Alert>
    );
  }

  if (showConfirmation) {
    return (
      <Card>
        <CardHeader>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-center">Challenge Created Successfully!</CardTitle>
          <CardDescription className="text-center">
            Your head-to-head bet challenge has been sent and is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Challenge Link</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => copyToClipboard(challengeLink)}
              >
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </div>
            <p className="text-sm mt-2 break-all">{challengeLink}</p>
          </div>

          <div>
            <SocialShareOptions 
              challengeUrl={challengeLink} 
              challengeTitle={form.getValues().challengeType === 'sports' ? 'Sports Bet' : 'Custom Bet'}
              onShare={(platform) => {
                toast({
                  title: `Shared via ${platform}`,
                  description: "Your challenge link has been shared",
                });
              }}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">What happens next?</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                Your friend will receive your challenge invitation
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                If they accept, the bet amount will be reserved from both accounts
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                Once the outcome is determined, the winner receives the full amount
              </li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowConfirmation(false)}>
            Create Another Challenge
          </Button>
          <Button>
            View My Challenges
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Create Head-to-Head Bet Challenge
        </CardTitle>
        <CardDescription>
          Challenge a friend to a direct betting duel with real money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bet Amount */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bet Amount (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="0.00" 
                          className="pl-9" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The amount both parties will wager on this bet
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency Type */}
              <FormField
                control={form.control}
                name="currencyType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Currency Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="real" id="currency-real" />
                          <Label htmlFor="currency-real" className="flex items-center cursor-pointer">
                            <DollarSign className="h-4 w-4 mr-1 text-green-600" /> 
                            Real Money
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="virtual" id="currency-virtual" disabled />
                          <Label htmlFor="currency-virtual" className="flex items-center cursor-pointer text-muted-foreground">
                            <div className="h-4 w-4 mr-1 text-blue-500 font-bold">W</div>
                            WeParlay Cash
                            <Badge variant="outline" className="ml-2 text-xs">Head-to-Head Only</Badge>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Head-to-head bets currently only support real money
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Challenge Type */}
            <FormField
              control={form.control}
              name="challengeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Type</FormLabel>
                  <FormControl>
                    <Tabs 
                      value={field.value} 
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sports">Sports Event</TabsTrigger>
                        <TabsTrigger value="custom">Custom Bet</TabsTrigger>
                      </TabsList>

                      <TabsContent value="sports" className="mt-4">
                        <FormField
                          control={form.control}
                          name="eventId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Sports Event</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an event" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {activeEvents.map(event => (
                                      <SelectItem key={event.id} value={event.id}>
                                        {event.name} - {new Date(event.date).toLocaleDateString()}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                The sports event you want to bet on
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch('eventId') && (
                          <div className="mt-4 p-4 border rounded-lg">
                            <h4 className="font-medium">Betting Options</h4>
                            <RadioGroup defaultValue="lakers" className="mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="lakers" id="lakers" />
                                <Label htmlFor="lakers">Los Angeles Lakers to Win</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="warriors" id="warriors" />
                                <Label htmlFor="warriors">Golden State Warriors to Win</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="custom" className="mt-4">
                        <FormField
                          control={form.control}
                          name="customBet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Bet Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your custom bet here..." 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Clearly describe what the bet is about and how the winner will be determined
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Who are you challenging?</h3>

              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="contact-email" />
                          <Label htmlFor="contact-email" className="flex items-center cursor-pointer">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="contact-phone" />
                          <Label htmlFor="contact-phone" className="flex items-center cursor-pointer">
                            <Phone className="h-4 w-4 mr-1" />
                            Phone
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="username" id="contact-username" />
                          <Label htmlFor="contact-username" className="flex items-center cursor-pointer">
                            <Users className="h-4 w-4 mr-1" />
                            Username
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchContactMethod === 'email' ? 'Email Address' : 
                       watchContactMethod === 'phone' ? 'Phone Number' : 'Username'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          watchContactMethod === 'email' ? 'support@weparlay.io' : 
                          watchContactMethod === 'phone' ? '+1 (555) 123-4567' : 'username'
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {watchContactMethod === 'email' 
                        ? "We'll send them an email with your challenge" 
                        : watchContactMethod === 'phone'
                        ? "We'll send them an SMS with your challenge"
                        : "We'll notify them on WeParlay"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Expiry Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="date"
                          className="pl-9"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your challenge will automatically expire if not accepted by this date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information for your friend..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Accept Terms & Conditions</FormLabel>
                    <FormDescription>
                      I confirm this bet is with a friend for entertainment purposes only. 
                      Both parties must deposit funds for the bet to become active. 
                      All WeParlay platform rules apply.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert variant="default" className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Notice</AlertTitle>
              <AlertDescription>
                Head-to-head bets are currently the only bet type that accepts real money. 
                All other bet types use WeParlay Cash until further notice.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>Creating Challenge...</>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Create Head-to-Head Challenge
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HeadToHeadChallenge;