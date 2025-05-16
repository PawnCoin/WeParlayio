import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarCustomizer from './AvatarCustomizer';
import { useToast } from '@/hooks/use-toast';
import Confetti from '../animations/Confetti';

interface UserProfileProps {
  user: {
    id: number;
    username: string;
    avatarSettings?: any;
    balance: number;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const [avatarSettings, setAvatarSettings] = useState(user.avatarSettings || null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSaveAvatar = (newSettings: any) => {
    setAvatarSettings(newSettings);
    // In a real app, this would save to the database
    toast({
      title: "Avatar updated",
      description: "Your customized avatar has been saved!"
    });
    
    // Show confetti to celebrate the change
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Create initials from username for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const triggerConfettiDemo = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="container mx-auto py-6">
      <Confetti active={showConfetti} />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4 border-4" style={{ borderColor: avatarSettings?.suitColor || '#0074D9' }}>
                {avatarSettings ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      {/* Background Circle */}
                      <circle cx="50" cy="50" r="48" fill="#f9f9f9" stroke={avatarSettings.suitColor} strokeWidth="4" />
                      
                      {/* Body */}
                      <rect x="35" y="70" width="30" height="25" fill={avatarSettings.suitColor} rx="2" />
                      
                      {/* Head */}
                      <circle cx="50" cy="45" r="20" fill={avatarSettings.skinTone} />
                      
                      {/* Hair based on style */}
                      {avatarSettings.hairStyle === 'short' && (
                        <path d="M30 35 Q50 25 70 35 L70 30 Q50 15 30 30 Z" fill="#333" />
                      )}
                      
                      {avatarSettings.hairStyle === 'medium' && (
                        <path d="M30 45 Q30 20 50 20 Q70 20 70 45 Q60 35 50 35 Q40 35 30 45 Z" fill="#333" />
                      )}
                      
                      {avatarSettings.hairStyle === 'long' && (
                        <path d="M30 45 Q30 20 50 15 Q70 20 70 45 Q75 60 70 65 Q60 40 50 40 Q40 40 30 65 Q25 60 30 45 Z" fill="#333" />
                      )}
                      
                      {avatarSettings.hairStyle === 'curly' && (
                        <path d="M30 35 Q35 20 50 20 Q65 20 70 35 Q75 45 70 50 Q65 30 50 30 Q35 30 30 50 Q25 45 30 35 Z" fill="#333" />
                      )}
                      
                      {avatarSettings.hairStyle === 'mohawk' && (
                        <rect x="45" y="15" width="10" height="25" fill="#333" />
                      )}
                      
                      {/* Eyes */}
                      <circle cx="40" cy="40" r="3" fill="#333" />
                      <circle cx="60" cy="40" r="3" fill="#333" />
                      
                      {/* Accessories */}
                      {avatarSettings.accessory === 'glasses' && (
                        <>
                          <circle cx="40" cy="40" r="5" fill="none" stroke="#333" strokeWidth="1" />
                          <circle cx="60" cy="40" r="5" fill="none" stroke="#333" strokeWidth="1" />
                          <line x1="45" y1="40" x2="55" y2="40" stroke="#333" strokeWidth="1" />
                        </>
                      )}
                      
                      {avatarSettings.accessory === 'sunglasses' && (
                        <>
                          <rect x="35" y="37" width="10" height="6" fill="#000" rx="1" />
                          <rect x="55" y="37" width="10" height="6" fill="#000" rx="1" />
                          <line x1="45" y1="40" x2="55" y2="40" stroke="#000" strokeWidth="1" />
                        </>
                      )}
                      
                      {avatarSettings.accessory === 'cap' && (
                        <path d="M30 35 Q50 25 70 35 L70 30 Q50 20 30 30 Z" fill={avatarSettings.suitColor} />
                      )}
                      
                      {avatarSettings.accessory === 'headband' && (
                        <path d="M30 38 Q50 33 70 38 L70 35 Q50 30 30 35 Z" fill={avatarSettings.suitColor} />
                      )}
                      
                      {avatarSettings.accessory === 'headphones' && (
                        <>
                          <path d="M30 35 C25 45 25 50 30 55" fill="none" stroke="#333" strokeWidth="2" />
                          <path d="M70 35 C75 45 75 50 70 55" fill="none" stroke="#333" strokeWidth="2" />
                          <rect x="27" y="45" width="5" height="10" fill="#333" rx="2" />
                          <rect x="68" y="45" width="5" height="10" fill="#333" rx="2" />
                        </>
                      )}
                      
                      {/* Smile */}
                      <path d="M40 50 Q50 60 60 50" fill="none" stroke="#333" strokeWidth="1.5" />
                      
                      {/* WeParlay Logo Element */}
                      <rect x="45" y="68" width="10" height="5" fill="white" rx="1" />
                      <text x="46" y="72.5" fontSize="4" fill={avatarSettings.suitColor} fontWeight="bold">WP</text>
                    </svg>
                  </div>
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(user.username)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
              <div className="text-lg font-medium mb-4">
                Balance: ${user.balance.toFixed(2)}
              </div>
              
              <Button 
                className="w-full"
                onClick={triggerConfettiDemo}
                style={{backgroundColor: avatarSettings?.suitColor || '#0074D9'}}
              >
                Preview Win Animation
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="avatar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avatar">Avatar Customization</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avatar">
              <Card>
                <CardContent className="pt-6">
                  <AvatarCustomizer 
                    username={user.username} 
                    onSave={handleSaveAvatar} 
                    initialSettings={avatarSettings}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your WeParlay experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Win Animations</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Choose when to show confetti and celebrations
                        </p>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="confetti-enabled"
                            className="mr-2" 
                            defaultChecked={true}
                          />
                          <label htmlFor="confetti-enabled">Enable confetti on wins</label>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Odds Format</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Choose your preferred odds display format
                        </p>
                        <select className="w-full p-2 border rounded-md">
                          <option value="american">American (+300)</option>
                          <option value="decimal">Decimal (4.00)</option>
                          <option value="fractional">Fractional (3/1)</option>
                        </select>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Theme</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Choose your preferred color theme
                        </p>
                        <select className="w-full p-2 border rounded-md">
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System Default</option>
                        </select>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Notifications</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Manage your notifications settings
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="notify-wins" className="mr-2" defaultChecked={true} />
                            <label htmlFor="notify-wins">Bet wins</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="notify-start" className="mr-2" defaultChecked={true} />
                            <label htmlFor="notify-start">Event start</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="notify-promos" className="mr-2" defaultChecked={true} />
                            <label htmlFor="notify-promos">Promotions</label>
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <Button 
                      className="w-full"
                      style={{backgroundColor: avatarSettings?.suitColor || '#0074D9'}}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;