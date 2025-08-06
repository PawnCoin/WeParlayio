import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, TrendingUp, Zap, DollarSign, Award } from "lucide-react";
import { motion } from 'framer-motion';

interface TierValueProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const ValueCalculator: React.FC = () => {
  const [bettingFrequency, setBettingFrequency] = useState<number>(10);
  const [averageBetAmount, setAverageBetAmount] = useState<number>(50);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['oddsBoost', 'voiceBetting']);
  const [selectedTier, setSelectedTier] = useState<string>('bronze');
  
  // Calculate the value based on the tier and inputs
  const calculateValue = () => {
    const tiers = {
      bronze: { oddsBoost: 0.025, voiceBettingLimit: 5, fantasySyncValue: 0 },
      silver: { oddsBoost: 0.035, voiceBettingLimit: 20, fantasySyncValue: 5 },
      gold: { oddsBoost: 0.05, voiceBettingLimit: 999, fantasySyncValue: 10 },
      platinum: { oddsBoost: 0.075, voiceBettingLimit: 999, fantasySyncValue: 15 }
    };
    
    const tierData = tiers[selectedTier as keyof typeof tiers];
    
    // Calculate odds boost value
    const oddsBoostValue = selectedFeatures.includes('oddsBoost') 
      ? (bettingFrequency * averageBetAmount * tierData.oddsBoost) 
      : 0;
    
    // Calculate voice betting value (time savings)
    const voiceBettingValue = selectedFeatures.includes('voiceBetting')
      ? Math.min(bettingFrequency, tierData.voiceBettingLimit) * 2 // $2 time value per voice bet
      : 0;
    
    // Calculate fantasy sync value
    const fantasySyncValue = selectedFeatures.includes('fantasySync') && tierData.fantasySyncValue > 0
      ? tierData.fantasySyncValue
      : 0;
      

      

    
    // Sum up the total value
    return {
      oddsBoostValue,
      voiceBettingValue,
      fantasySyncValue,
      total: oddsBoostValue + voiceBettingValue + fantasySyncValue
    };
  };
  
  const value = calculateValue();
  const monthlyPrice = selectedTier === 'bronze' ? 9.99 : 
                     selectedTier === 'silver' ? 19.99 : 
                     selectedTier === 'gold' ? 49.99 : 
                     99.99;
  
  const netValue = value.total - monthlyPrice;
  const roi = (netValue / monthlyPrice) * 100;
  
  // Define features that are available for each tier
  const tierFeatureAvailability = {
    bronze: ['oddsBoost', 'voiceBetting'],
    silver: ['oddsBoost', 'voiceBetting', 'fantasySync'],
    gold: ['oddsBoost', 'voiceBetting', 'fantasySync', 'yahooFantasy'],
    platinum: ['oddsBoost', 'voiceBetting', 'fantasySync', 'yahooFantasy', 'facebook']
  };
  
  // Filter selected features when tier changes
  useEffect(() => {
    const availableFeatures = tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability];
    setSelectedFeatures(prev => prev.filter(feature => availableFeatures.includes(feature)));
  }, [selectedTier]);
  
  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Calculator</CardTitle>
        <CardDescription>
          See how much value you'll get from your VIP membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tier selection */}
          <div>
            <Label>Select Tier</Label>
            <RadioGroup 
              value={selectedTier} 
              onValueChange={setSelectedTier}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
            >
              <TierRadioButton tier="bronze" selected={selectedTier === "bronze"} />
              <TierRadioButton tier="silver" selected={selectedTier === "silver"} />
              <TierRadioButton tier="gold" selected={selectedTier === "gold"} />
              <TierRadioButton tier="platinum" selected={selectedTier === "platinum"} />
            </RadioGroup>
          </div>
          
          {/* Betting frequency input */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>Monthly Bets</Label>
              <span className="text-sm font-medium">{bettingFrequency} bets</span>
            </div>
            <Slider 
              value={[bettingFrequency]} 
              onValueChange={(value) => setBettingFrequency(value[0])}
              min={1}
              max={50}
              step={1}
            />
          </div>
          
          {/* Average bet amount */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>Average Bet Amount</Label>
              <span className="text-sm font-medium">${averageBetAmount}</span>
            </div>
            <Slider 
              value={[averageBetAmount]} 
              onValueChange={(value) => setAverageBetAmount(value[0])}
              min={10}
              max={500}
              step={10}
            />
          </div>
          
          {/* Feature selection */}
          <div>
            <Label className="mb-2 block">Features You'll Use</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Odds Boost */}
              <Button
                type="button"
                variant={selectedFeatures.includes('oddsBoost') ? "default" : "outline"}
                onClick={() => handleFeatureToggle('oddsBoost')}
                className={`justify-start ${selectedFeatures.includes('oddsBoost') ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={!tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability].includes('oddsBoost')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Odds Boost</span>
                {selectedFeatures.includes('oddsBoost') && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
              
              {/* Voice Betting */}
              <Button
                type="button"
                variant={selectedFeatures.includes('voiceBetting') ? "default" : "outline"}
                onClick={() => handleFeatureToggle('voiceBetting')}
                className={`justify-start ${selectedFeatures.includes('voiceBetting') ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={!tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability].includes('voiceBetting')}
              >
                <Zap className="mr-2 h-4 w-4" />
                <span>Voice Betting</span>
                {selectedFeatures.includes('voiceBetting') && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
              
              {/* Fantasy Sync */}
              <Button
                type="button"
                variant={selectedFeatures.includes('fantasySync') ? "default" : "outline"}
                onClick={() => handleFeatureToggle('fantasySync')}
                className={`justify-start ${selectedFeatures.includes('fantasySync') ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={!tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability].includes('fantasySync')}
              >
                <Award className="mr-2 h-4 w-4" />
                <span>Fantasy Sync</span>
                {selectedFeatures.includes('fantasySync') && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
              
              {/* Yahoo Fantasy */}
              <Button
                type="button"
                variant={selectedFeatures.includes('yahooFantasy') ? "default" : "outline"}
                onClick={() => handleFeatureToggle('yahooFantasy')}
                className={`justify-start ${selectedFeatures.includes('yahooFantasy') ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={!tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability].includes('yahooFantasy')}
              >
                <Award className="mr-2 h-4 w-4" />
                <span>Yahoo Fantasy</span>
                {selectedFeatures.includes('yahooFantasy') && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
              
              {/* Facebook Integration */}
              <Button
                type="button"
                variant={selectedFeatures.includes('facebook') ? "default" : "outline"}
                onClick={() => handleFeatureToggle('facebook')}
                className={`justify-start ${selectedFeatures.includes('facebook') ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={!tierFeatureAvailability[selectedTier as keyof typeof tierFeatureAvailability].includes('facebook')}
              >
                <Award className="mr-2 h-4 w-4" />
                <span>Facebook App</span>
                {selectedFeatures.includes('facebook') && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Value summary */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-green-700 dark:text-green-400">Monthly Value</h3>
                  <div className="space-y-2">
                    {value.oddsBoostValue > 0 && (
                      <motion.div 
                        className="flex justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span>Odds Boost Value:</span>
                        <span className="font-medium">${value.oddsBoostValue.toFixed(2)}</span>
                      </motion.div>
                    )}
                    
                    {value.voiceBettingValue > 0 && (
                      <motion.div 
                        className="flex justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span>Voice Betting Value:</span>
                        <span className="font-medium">${value.voiceBettingValue.toFixed(2)}</span>
                      </motion.div>
                    )}
                    
                    {value.fantasySyncValue > 0 && (
                      <motion.div 
                        className="flex justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span>Fantasy Sync Value:</span>
                        <span className="font-medium">${value.fantasySyncValue.toFixed(2)}</span>
                      </motion.div>
                    )}
                    

                    

                    
                    <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between font-bold text-green-700 dark:text-green-400">
                      <span>Total Value:</span>
                      <span>${value.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Membership Cost:</span>
                      <span>-${monthlyPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between font-bold text-xl">
                      <span>Net Value:</span>
                      <span className={netValue >= 0 ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}>
                        ${netValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h3 className="text-base font-medium mb-2">Return on Investment</h3>
                  <div className="text-5xl font-bold mb-2 text-center">
                    {roi.toFixed(0)}%
                  </div>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    {roi >= 100 ? 
                      "Excellent value! Your membership more than pays for itself." : 
                      roi >= 50 ? 
                        "Great value for the features you're using." : 
                        roi >= 0 ? 
                          "Good value. Consider using more features to maximize your benefits." : 
                          "Try adjusting your betting habits or exploring more features to increase value."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

const TierRadioButton: React.FC<TierValueProps & { selected: boolean }> = ({ tier, selected }) => {
  const tierData = {
    bronze: { 
      name: 'Bronze', 
      color: 'bg-amber-700',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-700',
      price: '$9.99'
    },
    silver: { 
      name: 'Silver', 
      color: 'bg-slate-400',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-400',
      price: '$19.99'
    },
    gold: { 
      name: 'Gold', 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      price: '$49.99'
    },
    platinum: { 
      name: 'Platinum', 
      color: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-600',
      price: '$99.99'
    }
  };
  
  const currentTier = tierData[tier];
  
  return (
    <div className="relative">
      <RadioGroupItem value={tier} id={`tier-${tier}`} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      <label
        htmlFor={`tier-${tier}`}
        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
          selected 
            ? `${currentTier.color} text-white border-transparent` 
            : `border-gray-200 dark:border-gray-700 hover:bg-gray-50 ${currentTier.borderColor}`
        }`}
      >
        <span className={`text-lg font-bold ${selected ? 'text-white' : currentTier.textColor}`}>
          {currentTier.name}
        </span>
        <span className={`text-sm ${selected ? 'text-white/80' : 'text-gray-500'}`}>
          {currentTier.price}/mo
        </span>
      </label>
    </div>
  );
};

export default ValueCalculator;