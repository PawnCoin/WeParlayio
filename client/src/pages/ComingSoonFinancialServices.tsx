import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet } from 'lucide-react';

type FinancialService = 'banking' | 'crypto';

export default function ComingSoonFinancialServices({ service }: { service: FinancialService }) {
  const isCrypto = service === 'crypto';
  const Icon = isCrypto ? Wallet : CreditCard;
  const title = isCrypto ? 'Crypto Wallet' : 'Debit Card & Cashier';
  const detail = isCrypto
    ? 'Crypto deposits, custody, transfers, and withdrawals are not active during the WeParlay Cash-only launch.'
    : 'Debit-card deposits and withdrawals will open only after identity, age, location, licensing, and payment-provider requirements are complete.';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" /> {title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="secondary">Coming Soon</Badge>
          <p className="text-muted-foreground">{detail}</p>
          <p className="text-sm text-muted-foreground">WeParlay currently supports WeParlay Cash only. This feature is retained for a later compliant release.</p>
        </CardContent>
      </Card>
    </div>
  );
}
