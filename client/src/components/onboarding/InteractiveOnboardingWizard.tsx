import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Trophy, 
  Wallet, 
  Bell, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Target,
  DollarSign,
  Smartphone,
  Mail,
  Lock
} from "lucide-react";

interface OnboardingData {
  personalInfo: {
    displayName: string;
    favoriteTeams: string[];
    experience: string;
    interests: string[];
  };
  preferences: {
    betTypes: string[];
    sports: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisible: boolean;
      shareWins: boolean;
    };
  };
  account: {
    depositMethod: string;
    initialDeposit: number;
    twoFactorAuth: boolean;
  };
}

interface InteractiveOnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export default function InteractiveOnboardingWizard({ onComplete, onSkip }: InteractiveOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      displayName: '',
      favoriteTeams: [],
      experience: '',
      interests: []
    },
    preferences: {
      betTypes: [],
      sports: [],
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      privacy: {
        profileVisible: true,
        shareWins: false
      }
    },
    account: {
      depositMethod: '',
      initialDeposit: 0,
      twoFactorAuth: false
    }
  });
  
  const { toast } = useToast();
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const sportsOptions = [
    'NFL Football', 'NBA Basketball', 'MLB Baseball', 'NHL Hockey',
    'College Football', 'College Basketball', 'Soccer/Football', 'Tennis',
    'Boxing/MMA', 'Golf', 'NASCAR', 'Esports'
  ];

  const betTypeOptions = [
    'Moneyline', 'Point Spread', 'Over/Under', 'Props', 
    'Parlays', 'Live Betting', 'Futures', 'Head-to-Head'
  ];

  const interestOptions = [
    'Fantasy Sports', 'Social Betting', 'Tournaments', 'VIP Features',
    'Crypto Trading', 'Live Streaming', 'Statistics', 'Community'
  ];

  const teamOptions = [
    // NFL Teams
    'Cowboys', 'Patriots', 'Packers', 'Steelers', 'Chiefs', 'Eagles', 'Bills', 'Rams', 'Bengals', 'Ravens', 'Titans', 'Colts', 'Browns', 'Dolphins', 'Jets', 'Giants',
    'Washington', 'Saints', 'Falcons', 'Panthers', 'Buccaneers', '49ers', 'Seahawks', 'Cardinals', 'Broncos', 'Raiders', 'Chargers', 'Bears', 'Lions', 'Vikings', 'Texans', 'Jaguars',
    // NBA Teams  
    'Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls', 'Knicks', 'Nets', 'Bucks', 'Nuggets', 'Suns', 'Clippers', 'Mavericks', 'Spurs', 'Rockets', 'Thunder', 'Jazz',
    'Blazers', 'Kings', 'Grizzlies', 'Pelicans', '76ers', 'Raptors', 'Pacers', 'Cavaliers', 'Pistons', 'Hawks', 'Hornets', 'Magic', 'Wizards', 'Timberwolves',
    // MLB Teams
    'Yankees', 'Dodgers', 'Red Sox', 'Cardinals', 'Giants', 'Cubs', 'Astros', 'Braves', 'Mets', 'Phillies', 'Padres', 'Blue Jays', 'Mariners', 'Rangers', 'Angels', 'Athletics',
    'Guardians', 'Tigers', 'Twins', 'White Sox', 'Royals', 'Orioles', 'Rays', 'Marlins', 'Nationals', 'Pirates', 'Reds', 'Brewers', 'Rockies', 'Diamondbacks',
    // NHL Teams
    'Maple Leafs', 'Canadiens', 'Bruins', 'Rangers', 'Penguins', 'Capitals', 'Lightning', 'Panthers', 'Hurricanes', 'Devils', 'Islanders', 'Flyers', 'Blue Jackets', 'Sabres',
    'Red Wings', 'Blackhawks', 'Blues', 'Wild', 'Predators', 'Stars', 'Avalanche', 'Jets', 'Flames', 'Oilers', 'Canucks', 'Kraken', 'Golden Knights', 'Kings', 'Ducks', 'Sharks', 'Coyotes'
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Welcome to WeParlay! 🎉",
      description: "Your account is set up and ready for action!"
    });
    onComplete(data);
  };

  const updateData = (section: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleArrayItem = (section: keyof OnboardingData, field: string, item: string) => {
    setData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to WeParlay!</CardTitle>
              <CardDescription>Let's personalize your betting experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={data.personalInfo.displayName}
                  onChange={(e) => updateData('personalInfo', 'displayName', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Betting Experience Level</Label>
                <Select 
                  value={data.personalInfo.experience} 
                  onValueChange={(value) => updateData('personalInfo', 'experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - New to sports betting</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Experienced bettor</SelectItem>
                    <SelectItem value="professional">Professional - Expert level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Favorite Teams (Select up to 3)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teamOptions.map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox
                        id={team}
                        checked={data.personalInfo.favoriteTeams.includes(team)}
                        onCheckedChange={() => toggleArrayItem('personalInfo', 'favoriteTeams', team)}
                        disabled={data.personalInfo.favoriteTeams.length >= 3 && !data.personalInfo.favoriteTeams.includes(team)}
                      />
                      <Label htmlFor={team} className="text-sm">{team}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Sports & Betting Preferences</CardTitle>
              <CardDescription>Choose your favorite sports and bet types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Favorite Sports</Label>
                <div className="grid grid-cols-2 gap-2">
                  {sportsOptions.map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={data.preferences.sports.includes(sport)}
                        onCheckedChange={() => toggleArrayItem('preferences', 'sports', sport)}
                      />
                      <Label htmlFor={sport} className="text-sm">{sport}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Preferred Bet Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {betTypeOptions.map((betType) => (
                    <div key={betType} className="flex items-center space-x-2">
                      <Checkbox
                        id={betType}
                        checked={data.preferences.betTypes.includes(betType)}
                        onCheckedChange={() => toggleArrayItem('preferences', 'betTypes', betType)}
                      />
                      <Label htmlFor={betType} className="text-sm">{betType}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={data.personalInfo.interests.includes(interest)}
                        onCheckedChange={() => toggleArrayItem('personalInfo', 'interests', interest)}
                      />
                      <Label htmlFor={interest} className="text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Notification Preferences</CardTitle>
              <CardDescription>Stay updated on your bets and opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Bet confirmations, wins, and updates</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={data.preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      setData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            email: checked as boolean
                          }
                        }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Instant alerts for important events</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={data.preferences.notifications.sms}
                    onCheckedChange={(checked) => 
                      setData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            sms: checked as boolean
                          }
                        }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Live bet updates and opportunities</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={data.preferences.notifications.push}
                    onCheckedChange={(checked) => 
                      setData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            push: checked as boolean
                          }
                        }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <Label className="text-base font-semibold">Privacy Settings</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-500">Allow others to see your profile</p>
                  </div>
                  <Checkbox
                    checked={data.preferences.privacy.profileVisible}
                    onCheckedChange={(checked) => 
                      setData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: {
                            ...prev.preferences.privacy,
                            profileVisible: checked as boolean
                          }
                        }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Wins</Label>
                    <p className="text-sm text-gray-500">Celebrate wins with the community</p>
                  </div>
                  <Checkbox
                    checked={data.preferences.privacy.shareWins}
                    onCheckedChange={(checked) => 
                      setData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: {
                            ...prev.preferences.privacy,
                            shareWins: checked as boolean
                          }
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Account Funding</CardTitle>
              <CardDescription>Set up your payment method and initial deposit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Preferred Deposit Method</Label>
                <Select 
                  value={data.account.depositMethod} 
                  onValueChange={(value) => updateData('account', 'depositMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your deposit method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Cryptocurrency Wallet</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Credit/Debit Card</SelectItem>
                    <SelectItem value="cashapp">Cash App</SelectItem>
                    <SelectItem value="later">I'll set this up later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="initialDeposit">Initial Deposit Amount (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="initialDeposit"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={data.account.initialDeposit || ''}
                    onChange={(e) => updateData('account', 'initialDeposit', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Start with any amount. You can always add more funds later.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Smart Start Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start small and learn the platform</li>
                  <li>• Use WeParlay Cash for practice bets</li>
                  <li>• Set betting limits to stay in control</li>
                  <li>• Join our community for tips and strategies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Security & Final Setup</CardTitle>
              <CardDescription>Protect your account and complete your setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-green-500" />
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Extra security for your account</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={data.account.twoFactorAuth}
                    onCheckedChange={(checked) => updateData('account', 'twoFactorAuth', checked)}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
                <h4 className="font-bold text-lg mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Setup Summary
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Display Name:</span>
                    <Badge variant="secondary">{data.personalInfo.displayName || 'Not set'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <Badge variant="secondary">{data.personalInfo.experience || 'Not set'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorite Sports:</span>
                    <Badge variant="secondary">{data.preferences.sports.length} selected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Notifications:</span>
                    <Badge variant="secondary">
                      {Object.values(data.preferences.notifications).filter(Boolean).length} enabled
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <Badge variant="secondary">{data.account.depositMethod || 'Not set'}</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🎉 You're Ready to Start!</h4>
                <p className="text-sm text-green-700">
                  Your WeParlay account is configured and ready for action. 
                  Welcome to the future of social sports betting!
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Account Setup</h2>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip Setup
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {currentStep === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}