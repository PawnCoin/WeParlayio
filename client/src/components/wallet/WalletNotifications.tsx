import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Wallet, Coins, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, ExternalLink, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: "transaction" | "price" | "security" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    walletAddress?: string;
    currency?: string;
    amount?: string;
    priceChange?: number;
    betId?: string;
    txHash?: string;
  };
}

const WalletNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Load mock notifications
  useEffect(() => {
    // In a real implementation, this would load from an API
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "transaction",
        title: "Deposit Confirmed",
        message: "Your deposit of 0.25 ETH has been confirmed",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        data: {
          walletAddress: "0x8c34F41F1cf2D63A58c14E785A91b3c4A49E4ebF",
          currency: "ETH",
          amount: "0.25",
          txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        }
      },
      {
        id: "2",
        type: "price",
        title: "Price Alert",
        message: "ETH has increased by more than 5% in the last hour",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        data: {
          currency: "ETH",
          priceChange: 5.8
        }
      },
      {
        id: "3",
        type: "security",
        title: "New Wallet Login",
        message: "Your wallet was connected from a new device",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      },
      {
        id: "4",
        type: "transaction",
        title: "Bet Placed",
        message: "Your bet of 0.1 ETH on Lakers vs. Warriors has been confirmed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        read: true,
        data: {
          currency: "ETH",
          amount: "0.1",
          betId: "bet-123456"
        }
      },
      {
        id: "5",
        type: "system",
        title: "Maintenance Notice",
        message: "WeParlay will undergo scheduled maintenance in 24 hours",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => prev - 1);
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
    
    toast({
      title: "All notifications marked as read",
      description: "You've cleared all your unread notifications",
    });
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string, data?: any) => {
    switch (type) {
      case "transaction":
        if (data?.amount) {
          return data.amount.includes("bet") 
            ? <Coins className="h-5 w-5 text-blue-500" /> 
            : <Wallet className="h-5 w-5 text-green-500" />;
        }
        return <Wallet className="h-5 w-5 text-green-500" />;
      case "price":
        return data?.priceChange && data.priceChange > 0 
          ? <TrendingUp className="h-5 w-5 text-green-500" /> 
          : <TrendingDown className="h-5 w-5 text-red-500" />;
      case "security":
        return <Bell className="h-5 w-5 text-amber-500" />;
      case "system":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer py-2 px-4 focus:bg-accent hover:bg-accent ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.data)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`text-sm font-medium ${!notification.read ? "text-primary" : ""}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    {/* Transaction hash link */}
                    {notification.data?.txHash && (
                      <a 
                        href={`https://etherscan.io/tx/${notification.data.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Etherscan
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    
                    {/* Price change format */}
                    {notification.data?.priceChange && (
                      <div className={`flex items-center mt-1 text-xs ${
                        notification.data.priceChange > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {notification.data.priceChange > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        <span>{notification.data.priceChange > 0 ? "+" : ""}{notification.data.priceChange}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-center rounded-none text-xs"
            onClick={() => toast({
              title: "Coming Soon",
              description: "Notification settings will be available soon",
            })}
          >
            Notification Settings
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletNotifications;