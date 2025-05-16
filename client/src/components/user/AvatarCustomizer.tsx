import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// WeParlay theme colors
const weParlaySkinTones = [
  '#FFDBAC', // light
  '#F1C27D', // medium-light
  '#E0AC69', // medium
  '#C68642', // medium-dark
  '#8D5524', // dark
];

const weParlaySuitColors = [
  '#0074D9', // blue from logo
  '#2ECC40', // green from logo
  '#FF851B', // orange from logo
  '#111111', // black
  '#7FDBFF', // light blue
  '#FF4136', // red
  '#B10DC9', // purple
];

const hairStyles = [
  'short',
  'medium',
  'long',
  'curly',
  'bald',
  'mohawk',
];

const accessoryOptions = [
  'none',
  'glasses',
  'sunglasses',
  'cap',
  'headband',
  'headphones',
];

// Random avatar generation based on WeParlay theme
const generateRandomAvatar = (username: string) => {
  const randomSkinTone = weParlaySkinTones[Math.floor(Math.random() * weParlaySkinTones.length)];
  const randomSuitColor = weParlaySuitColors[Math.floor(Math.random() * weParlaySuitColors.length)];
  const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
  const randomAccessory = accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)];
  
  // Create unique seed from username for consistent avatar
  const seed = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    seed,
    skinTone: randomSkinTone,
    suitColor: randomSuitColor,
    hairStyle: randomHair,
    accessory: randomAccessory,
  };
};

// This component creates an SVG Avatar with the provided customizations
const SVGAvatar = ({ 
  skinTone = '#FFDBAC', 
  suitColor = '#0074D9', 
  hairStyle = 'short',
  accessory = 'none',
  size = 100 
}: {
  skinTone?: string;
  suitColor?: string;
  hairStyle?: string;
  accessory?: string;
  size?: number;
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#f9f9f9" stroke={suitColor} strokeWidth="4" />
      
      {/* Body - Suit with WeParlay color */}
      <rect x="35" y="70" width="30" height="25" fill={suitColor} rx="2" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="20" fill={skinTone} />
      
      {/* Hair based on style */}
      {hairStyle === 'short' && (
        <path d="M30 35 Q50 25 70 35 L70 30 Q50 15 30 30 Z" fill="#333" />
      )}
      
      {hairStyle === 'medium' && (
        <path d="M30 45 Q30 20 50 20 Q70 20 70 45 Q60 35 50 35 Q40 35 30 45 Z" fill="#333" />
      )}
      
      {hairStyle === 'long' && (
        <path d="M30 45 Q30 20 50 15 Q70 20 70 45 Q75 60 70 65 Q60 40 50 40 Q40 40 30 65 Q25 60 30 45 Z" fill="#333" />
      )}
      
      {hairStyle === 'curly' && (
        <path d="M30 35 Q35 20 50 20 Q65 20 70 35 Q75 45 70 50 Q65 30 50 30 Q35 30 30 50 Q25 45 30 35 Z" fill="#333" />
      )}
      
      {hairStyle === 'mohawk' && (
        <rect x="45" y="15" width="10" height="25" fill="#333" />
      )}
      
      {/* Eyes */}
      <circle cx="40" cy="40" r="3" fill="#333" />
      <circle cx="60" cy="40" r="3" fill="#333" />
      
      {/* Accessories */}
      {accessory === 'glasses' && (
        <>
          <circle cx="40" cy="40" r="5" fill="none" stroke="#333" strokeWidth="1" />
          <circle cx="60" cy="40" r="5" fill="none" stroke="#333" strokeWidth="1" />
          <line x1="45" y1="40" x2="55" y2="40" stroke="#333" strokeWidth="1" />
        </>
      )}
      
      {accessory === 'sunglasses' && (
        <>
          <rect x="35" y="37" width="10" height="6" fill="#000" rx="1" />
          <rect x="55" y="37" width="10" height="6" fill="#000" rx="1" />
          <line x1="45" y1="40" x2="55" y2="40" stroke="#000" strokeWidth="1" />
        </>
      )}
      
      {accessory === 'cap' && (
        <path d="M30 35 Q50 25 70 35 L70 30 Q50 20 30 30 Z" fill={suitColor} />
      )}
      
      {accessory === 'headband' && (
        <path d="M30 38 Q50 33 70 38 L70 35 Q50 30 30 35 Z" fill={suitColor} />
      )}
      
      {accessory === 'headphones' && (
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
      <text x="46" y="72.5" fontSize="4" fill={suitColor} fontWeight="bold">WP</text>
    </svg>
  );
};

interface AvatarCustomizerProps {
  username: string;
  onSave: (avatarSettings: any) => void;
  initialSettings?: any;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ 
  username, 
  onSave,
  initialSettings 
}) => {
  const { toast } = useToast();
  const [avatarSettings, setAvatarSettings] = useState(
    initialSettings || generateRandomAvatar(username)
  );
  
  const handleSaveAvatar = () => {
    onSave(avatarSettings);
    toast({
      title: "Avatar saved!",
      description: "Your new avatar has been updated successfully.",
    });
  };
  
  const handleRandomize = () => {
    setAvatarSettings(generateRandomAvatar(username + Date.now()));
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Customize Your Avatar</CardTitle>
        <CardDescription>Create your unique WeParlay avatar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-32 h-32 border-4" style={{ borderColor: avatarSettings.suitColor }}>
              <SVGAvatar 
                skinTone={avatarSettings.skinTone}
                suitColor={avatarSettings.suitColor}
                hairStyle={avatarSettings.hairStyle}
                accessory={avatarSettings.accessory}
                size={128}
              />
            </Avatar>
          </div>
          
          <Button variant="outline" onClick={handleRandomize} className="mb-4">
            Randomize
          </Button>
        </div>

        <Tabs defaultValue="style">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="color">Colors</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style">
            <div className="space-y-4">
              <div>
                <Label>Hair Style</Label>
                <RadioGroup
                  value={avatarSettings.hairStyle}
                  onValueChange={(value) => setAvatarSettings({...avatarSettings, hairStyle: value})}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  {hairStyles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <RadioGroupItem value={style} id={`hair-${style}`} />
                      <Label htmlFor={`hair-${style}`} className="capitalize">{style}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="color">
            <div className="space-y-4">
              <div>
                <Label>Skin Tone</Label>
                <div className="flex mt-2 space-x-2">
                  {weParlaySkinTones.map((color) => (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer ${avatarSettings.skinTone === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAvatarSettings({...avatarSettings, skinTone: color})}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label>WeParlay Theme Color</Label>
                <div className="flex flex-wrap mt-2 gap-2">
                  {weParlaySuitColors.map((color) => (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer ${avatarSettings.suitColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAvatarSettings({...avatarSettings, suitColor: color})}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="accessories">
            <div>
              <Label>Accessory</Label>
              <RadioGroup
                value={avatarSettings.accessory}
                onValueChange={(value) => setAvatarSettings({...avatarSettings, accessory: value})}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                {accessoryOptions.map((accessory) => (
                  <div key={accessory} className="flex items-center space-x-2">
                    <RadioGroupItem value={accessory} id={`accessory-${accessory}`} />
                    <Label htmlFor={`accessory-${accessory}`} className="capitalize">{accessory}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveAvatar} className="w-full" style={{backgroundColor: avatarSettings.suitColor}}>
          Save Avatar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AvatarCustomizer;