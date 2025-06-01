import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ProgressivePayoutTier {
  legs: number;
  hits: number;
  multiplier: number;
  description: string;
}

const progressivePayoutStructure: ProgressivePayoutTier[] = [
  { legs: 4, hits: 3, multiplier: 1.5, description: "3 of 4 selections correct" },
  { legs: 4, hits: 4, multiplier: 10, description: "Perfect 4-leg parlay" },
  { legs: 5, hits: 3, multiplier: 1.2, description: "3 of 5 selections correct" },
  { legs: 5, hits: 4, multiplier: 5, description: "4 of 5 selections correct" },
  { legs: 5, hits: 5, multiplier: 25, description: "Perfect 5-leg parlay" },
  { legs: 6, hits: 4, multiplier: 2, description: "4 of 6 selections correct" },
  { legs: 6, hits: 5, multiplier: 8, description: "5 of 6 selections correct" },
  { legs: 6, hits: 6, multiplier: 50, description: "Perfect 6-leg parlay" },
  { legs: 7, hits: 4, multiplier: 1.5, description: "4 of 7 selections correct" },
  { legs: 7, hits: 5, multiplier: 5, description: "5 of 7 selections correct" },
  { legs: 7, hits: 6, multiplier: 15, description: "6 of 7 selections correct" },
  { legs: 7, hits: 7, multiplier: 100, description: "Perfect 7-leg parlay" },
  { legs: 8, hits: 5, multiplier: 3, description: "5 of 8 selections correct" },
  { legs: 8, hits: 6, multiplier: 8, description: "6 of 8 selections correct" },
  { legs: 8, hits: 7, multiplier: 25, description: "7 of 8 selections correct" },
  { legs: 8, hits: 8, multiplier: 200, description: "Perfect 8-leg parlay" },
];

interface ProgressiveParlayRulesProps {
  selectedLegs: number;
  betAmount: number;
}

export const ProgressiveParlayRules: React.FC<ProgressiveParlayRulesProps> = ({
  selectedLegs,
  betAmount
}) => {
  const [activeTab, setActiveTab] = useState("payouts");

  const getRelevantPayouts = () => {
    return progressivePayoutStructure.filter(tier => tier.legs === selectedLegs);
  };

  const calculatePayout = (multiplier: number) => {
    return (betAmount * multiplier).toFixed(2);
  };

  const getPayoutColor = (hits: number, legs: number) => {
    const percentage = hits / legs;
    if (percentage === 1) return "bg-green-500 text-white";
    if (percentage >= 0.8) return "bg-blue-500 text-white";
    if (percentage >= 0.6) return "bg-yellow-500 text-black";
    return "bg-gray-500 text-white";
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Progressive Parlay Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payouts">Payout Structure</TabsTrigger>
            <TabsTrigger value="rules">General Rules</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="payouts" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Progressive parlays offer partial payouts even if not all selections win. 
              Minimum 4 legs required.
            </div>

            {selectedLegs >= 4 ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Payouts for {selectedLegs}-leg Progressive Parlay
                </h4>
                {getRelevantPayouts().map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-3">
                      <Badge className={getPayoutColor(tier.hits, tier.legs)}>
                        {tier.hits}/{tier.legs}
                      </Badge>
                      <span className="text-sm text-gray-700">{tier.description}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {tier.multiplier}x
                      </div>
                      <div className="text-sm text-green-600">
                        ${calculatePayout(tier.multiplier)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Select at least 4 legs to see progressive payout structure</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  How Progressive Parlays Work
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Minimum 4 selections required, maximum 8 selections</li>
                  <li>• You can still win money even if some picks lose</li>
                  <li>• Higher number of correct picks = higher payout multiplier</li>
                  <li>• All selections must have odds between -300 and +300</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Important Rules
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Ties count as wins for progressive parlay calculations</li>
                  <li>• Cancelled games are removed from the parlay</li>
                  <li>• Minimum bet amount: $1.00</li>
                  <li>• Maximum bet amount: $500.00</li>
                  <li>• Same game parlays not eligible for progressive payouts</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Restrictions
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Cannot combine with other bet types</li>
                  <li>• Live betting selections not eligible</li>
                  <li>• Props and futures excluded from progressive parlays</li>
                  <li>• One progressive parlay per customer per day</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Progressive Parlay Calculator</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Number of Legs</label>
                  <div className="text-2xl font-bold text-blue-600">{selectedLegs}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bet Amount</label>
                  <div className="text-2xl font-bold text-green-600">${betAmount}</div>
                </div>
              </div>

              {selectedLegs >= 4 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">Potential Payouts:</h5>
                  {getRelevantPayouts().map((tier, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm">{tier.hits} correct picks</span>
                      <span className="font-semibold text-green-600">
                        ${calculatePayout(tier.multiplier)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};