import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletConnectionOptimized from '@/components/wallet/WalletConnectionOptimized';

const WalletSimple: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Crypto Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletConnectionOptimized />
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSimple;