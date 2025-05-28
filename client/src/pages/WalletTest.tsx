
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WalletTest: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Management Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>If you can see this page, the routing is working correctly.</p>
          <p>The enhanced wallet management should be available at /wallet-management-enhanced</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletTest;
