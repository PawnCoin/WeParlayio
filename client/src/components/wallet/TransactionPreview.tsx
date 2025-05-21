import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, AlertTriangle, ExternalLink, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: "bet" | "deposit" | "withdraw";
  amount: string;
  currency: string;
  odds?: string;
  network?: string;
  recipient?: string;
  gasEstimate?: string;
  potentialWin?: string;
  sportEvent?: string;
  selection?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  open,
  onOpenChange,
  transactionType,
  amount,
  currency,
  odds,
  network,
  recipient,
  gasEstimate,
  potentialWin,
  sportEvent,
  selection,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { toast } = useToast();
  
  const getTransactionTitle = () => {
    switch (transactionType) {
      case "bet":
        return "Confirm Bet Transaction";
      case "deposit":
        return "Confirm Deposit Transaction";
      case "withdraw":
        return "Confirm Withdrawal Transaction";
      default:
        return "Confirm Transaction";
    }
  };

  const getTransactionDescription = () => {
    switch (transactionType) {
      case "bet":
        return "Review the details of your bet before confirming the transaction with your wallet";
      case "deposit":
        return "Review the details of your deposit before confirming the transaction with your wallet";
      case "withdraw":
        return "Review the details of your withdrawal before confirming the transaction with your wallet";
      default:
        return "Review the details of your transaction before confirming";
    }
  };
  
  const getNetworkColor = () => {
    switch (network?.toLowerCase()) {
      case "ethereum":
        return "text-blue-600 dark:text-blue-400";
      case "polygon":
        return "text-purple-600 dark:text-purple-400";
      case "optimism":
        return "text-red-600 dark:text-red-400";
      case "arbitrum":
        return "text-blue-500 dark:text-blue-300";
      case "solana":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };
  
  const getCurrencyIcon = () => {
    switch (currency) {
      case "BTC":
        return "₿";
      case "ETH":
        return "Ξ";
      case "SOL":
        return "◎";
      case "USDT":
      case "USDC":
        return "$";
      default:
        return "$";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTransactionTitle()}</DialogTitle>
          <DialogDescription>{getTransactionDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : (
            // Transaction details
            <div className="space-y-4">
              {/* Transaction Header */}
              <div className="flex justify-between pb-2 border-b">
                <div className="text-sm text-muted-foreground">Transaction Type</div>
                <div className="font-medium capitalize">{transactionType}</div>
              </div>

              {/* Main Transaction Details */}
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                {/* Amount */}
                <div className="flex justify-between">
                  <div className="text-sm">Amount</div>
                  <div className="font-bold">
                    {getCurrencyIcon()} {amount} {currency}
                  </div>
                </div>

                {/* Network */}
                {network && (
                  <div className="flex justify-between">
                    <div className="text-sm">Network</div>
                    <div className={`font-medium ${getNetworkColor()}`}>
                      {network}
                    </div>
                  </div>
                )}

                {/* Gas Estimate */}
                {gasEstimate && (
                  <div className="flex justify-between">
                    <div className="text-sm">Estimated Gas Fee</div>
                    <div className="font-medium">${gasEstimate}</div>
                  </div>
                )}

                {/* Recipient for withdrawals */}
                {transactionType === "withdraw" && recipient && (
                  <div className="flex justify-between">
                    <div className="text-sm">Recipient Address</div>
                    <div className="font-mono text-xs">
                      {recipient.substring(0, 6)}...{recipient.substring(recipient.length - 4)}
                    </div>
                  </div>
                )}

                {/* Betting specific details */}
                {transactionType === "bet" && (
                  <>
                    {sportEvent && (
                      <div className="flex justify-between">
                        <div className="text-sm">Event</div>
                        <div className="font-medium">{sportEvent}</div>
                      </div>
                    )}
                    {selection && (
                      <div className="flex justify-between">
                        <div className="text-sm">Selection</div>
                        <div className="font-medium">{selection}</div>
                      </div>
                    )}
                    {odds && (
                      <div className="flex justify-between">
                        <div className="text-sm">Odds</div>
                        <div className="font-medium">{odds}</div>
                      </div>
                    )}
                    {potentialWin && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <div className="text-sm">Potential Payout</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {getCurrencyIcon()} {potentialWin} {currency}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Security Note */}
              <div className="flex items-start bg-primary/10 p-2 rounded-md text-xs">
                <Shield className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Transaction Security</p>
                  <p className="mt-1 text-muted-foreground">
                    You will need to confirm this transaction using your connected wallet. 
                    WeParlay never has access to your private keys or funds.
                  </p>
                </div>
              </div>

              {/* Total with gas */}
              {gasEstimate && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <div>Total (incl. gas)</div>
                    <div>
                      {getCurrencyIcon()} {amount} {currency} + ${gasEstimate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            <Check className="h-4 w-4 mr-2" />
            Confirm with Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionPreview;