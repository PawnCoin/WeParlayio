import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell,
  MessageSquare,
  DollarSign,
  Smartphone,
  Mail,
  Calendar,
  Trophy,
  Clock,
  Radio,
  AlertTriangle,
  Shield,
  Share2,
  Save
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  priority: 'all' | 'important' | 'none';
  method: 'push' | 'email' | 'sms' | 'all';
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  channels: Record<string, boolean>;
  timePreference: 'immediately' | 'hourly' | 'daily';
}

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'push',
      name: 'Push Notifications',
      description: 'Receive alerts on your device',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: true,
      priority: 'all',
      method: 'push'
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Receive alerts via email',
      icon: <Mail className="h-5 w-5" />,
      enabled: true,
      priority: 'important',
      method: 'email'
    },
    {
      id: 'sms',
      name: 'Text Message (SMS)',
      description: 'Receive alerts via SMS',
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: false,
      priority: 'important',
      method: 'sms'
    }
  ]);
  
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'betting',
      name: 'Betting Activity',
      description: 'Bet placements, outcomes, and updates',
      icon: <DollarSign className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: true, sms: false },
      timePreference: 'immediately'
    },
    {
      id: 'events',
      name: 'Sports Events',
      description: 'Game starts, scores, and results',
      icon: <Calendar className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: false, sms: false },
      timePreference: 'immediately'
    },
    {
      id: 'wins',
      name: 'Wins & Achievements',
      description: 'Successful bets and achievements',
      icon: <Trophy className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: true, sms: true },
      timePreference: 'immediately'
    },
    {
      id: 'reminders',
      name: 'Reminders',
      description: 'Upcoming events and bet deadlines',
      icon: <Clock className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: true, sms: false },
      timePreference: 'hourly'
    },
    {
      id: 'promotions',
      name: 'Promotions & Offers',
      description: 'Special offers and bonuses',
      icon: <Radio className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: true, sms: false },
      timePreference: 'daily'
    },
    {
      id: 'security',
      name: 'Security Alerts',
      description: 'Account activity and security updates',
      icon: <Shield className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: true, sms: true },
      timePreference: 'immediately'
    },
    {
      id: 'social',
      name: 'Social Activity',
      description: 'Friend activity and shared bets',
      icon: <Share2 className="h-5 w-5" />,
      enabled: true,
      channels: { push: true, email: false, sms: false },
      timePreference: 'hourly'
    }
  ]);
  
  const [doNotDisturb, setDoNotDisturb] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    allowEmergency: true
  });
  
  const toggleChannel = (id: string, enabled: boolean) => {
    setChannels(channels.map(channel => 
      channel.id === id ? { ...channel, enabled } : channel
    ));
  };
  
  const updateChannelPriority = (id: string, priority: 'all' | 'important' | 'none') => {
    setChannels(channels.map(channel => 
      channel.id === id ? { ...channel, priority } : channel
    ));
  };
  
  const toggleCategory = (id: string, enabled: boolean) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, enabled } : category
    ));
  };
  
  const toggleCategoryChannel = (categoryId: string, channelId: string, enabled: boolean) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { ...category, channels: { ...category.channels, [channelId]: enabled } } 
        : category
    ));
  };
  
  const updateCategoryTimePreference = (id: string, timePreference: 'immediately' | 'hourly' | 'daily') => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, timePreference } : category
    ));
  };
  
  const saveSettings = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications from WeParlay
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <Tabs defaultValue="channels">
            <TabsList className="mb-4">
              <TabsTrigger value="channels">Delivery Methods</TabsTrigger>
              <TabsTrigger value="categories">Notification Types</TabsTrigger>
              <TabsTrigger value="schedule">Quiet Hours</TabsTrigger>
            </TabsList>
            
            {/* Delivery Methods Tab */}
            <TabsContent value="channels" className="space-y-6">
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className="p-2 rounded-full bg-primary/10 h-10 w-10 flex items-center justify-center">
                      {channel.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{channel.name}</h4>
                        <Switch 
                          checked={channel.enabled} 
                          onCheckedChange={(checked) => toggleChannel(channel.id, checked)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                      
                      {channel.enabled && (
                        <div className="mt-4 pt-4 border-t">
                          <Label className="mb-2 block">
                            Which notifications should be sent via {channel.name.toLowerCase()}?
                          </Label>
                          <RadioGroup 
                            value={channel.priority}
                            onValueChange={(value) => updateChannelPriority(channel.id, value as any)}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id={`${channel.id}-all`} />
                              <Label htmlFor={`${channel.id}-all`}>All notifications</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="important" id={`${channel.id}-important`} />
                              <Label htmlFor={`${channel.id}-important`}>Important notifications only</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id={`${channel.id}-none`} />
                              <Label htmlFor={`${channel.id}-none`}>No notifications (disable)</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Notification Types Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className="p-2 rounded-full bg-primary/10 h-10 w-10 flex items-center justify-center">
                      {category.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{category.name}</h4>
                        <Switch 
                          checked={category.enabled} 
                          onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      
                      {category.enabled && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-4">
                            <Label>Delivery methods</Label>
                            <div className="flex gap-2">
                              {channels.map((channel) => (
                                <div key={channel.id} className="flex items-center gap-1">
                                  <Switch 
                                    id={`${category.id}-${channel.id}`}
                                    checked={category.channels[channel.id] || false} 
                                    onCheckedChange={(checked) => toggleCategoryChannel(category.id, channel.id, checked)}
                                    disabled={!channel.enabled}
                                  />
                                  <Label 
                                    htmlFor={`${category.id}-${channel.id}`}
                                    className={`text-sm ${!channel.enabled ? 'text-muted-foreground' : ''}`}
                                  >
                                    {channel.id === 'push' ? 'Push' : channel.id === 'email' ? 'Email' : 'SMS'}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Timing</Label>
                            <Select 
                              value={category.timePreference}
                              onValueChange={(value) => updateCategoryTimePreference(category.id, value as any)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediately">Immediately</SelectItem>
                                <SelectItem value="hourly">Hourly digest</SelectItem>
                                <SelectItem value="daily">Daily digest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Quiet Hours Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <div className="space-y-6 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Do Not Disturb</h4>
                    <p className="text-sm text-muted-foreground">Pause notifications during specific hours</p>
                  </div>
                  <Switch 
                    checked={doNotDisturb.enabled} 
                    onCheckedChange={(checked) => setDoNotDisturb({...doNotDisturb, enabled: checked})}
                  />
                </div>
                
                {doNotDisturb.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <input 
                          id="start-time" 
                          type="time" 
                          value={doNotDisturb.startTime}
                          onChange={(e) => setDoNotDisturb({...doNotDisturb, startTime: e.target.value})}
                          className="w-full border rounded-md p-2 bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <input 
                          id="end-time" 
                          type="time" 
                          value={doNotDisturb.endTime}
                          onChange={(e) => setDoNotDisturb({...doNotDisturb, endTime: e.target.value})}
                          className="w-full border rounded-md p-2 bg-background"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="allow-emergency"
                        checked={doNotDisturb.allowEmergency} 
                        onCheckedChange={(checked) => setDoNotDisturb({...doNotDisturb, allowEmergency: checked})}
                      />
                      <Label htmlFor="allow-emergency" className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                        Allow emergency and security notifications
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={saveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationSettings;