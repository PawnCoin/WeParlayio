
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const CryptoTradingTools: React.FC = () => {
  const [gasPrice, setGasPrice] = useState(45);
  const [slippage, setSlippage] = useState(0.5);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Gas & MEV Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Current Gas Price:</span>
              <Badge variant="outline">{gasPrice} gwei</Badge>
            </div>
            <div className="flex justify-between">
              <span>MEV Protection:</span>
              <Badge variant="default" className="bg-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance:</span>
              <Badge variant="outline">{slippage}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoTradingTools;
