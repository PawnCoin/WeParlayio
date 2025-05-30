
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, 
  Home, 
  Wallet, 
  GameController2, 
  TrendingUp, 
  Settings,
  ExternalLink 
} from 'lucide-react';

const QuickNavButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickLinks = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4" />, color: "bg-blue-500" },
    { name: "Live Betting", path: "/live-betting-enhanced", icon: <TrendingUp className="h-4 w-4" />, color: "bg-green-500" },
    { name: "Esports Hub", path: "/esports-hub", icon: <GameController2 className="h-4 w-4" />, color: "bg-purple-500" },
    { name: "Wallet", path: "/wallet-management-enhanced", icon: <Wallet className="h-4 w-4" />, color: "bg-yellow-500" },
    { name: "My Bets", path: "/my-bets", icon: <TrendingUp className="h-4 w-4" />, color: "bg-red-500" },
    { name: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" />, color: "bg-gray-500" },
    { name: "All Pages", path: "/site-navigation", icon: <Navigation className="h-4 w-4" />, color: "bg-indigo-500" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          >
            <Navigation className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Quick Navigation
            </SheetTitle>
            <SheetDescription>
              Jump to any page quickly
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-3">
            {quickLinks.map((link) => (
              <Button
                key={link.path}
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => {
                  window.open(link.path, '_blank');
                  setIsOpen(false);
                }}
              >
                <div className={`p-1.5 rounded-md ${link.color} mr-3`}>
                  {link.icon}
                </div>
                <span className="flex-1 text-left">{link.name}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Use the "All Pages" link to access the complete site directory with search functionality.
            </p>
            <Badge variant="secondary" className="mt-2">
              {quickLinks.length - 1} Quick Links Available
            </Badge>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QuickNavButton;
