import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./Sidebar";
import BettingSlip from "../betting/BettingSlip";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import Logo from "@/components/WeParlay/Logo";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/live-betting", label: "Live Betting" },
    { href: "/fantasy", label: "Fantasy" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/results", label: "Results" },
    { href: "/social", label: "Social" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-black shadow-md px-4 dark:text-white text-black">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            
            {/* Navigation for desktop */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className={`${
                    location === link.href
                      ? "text-blue-600"
                      : "text-black dark:text-white hover:text-blue-500"
                  } font-medium cursor-pointer`}>
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center">
                        <span>${user?.balance.toFixed(2)}</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        Deposit Funds
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Withdraw Funds
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Transaction History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" />
                          <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block">{user?.username}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        My Bets
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="default" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600">
                  Log In
                </Button>
              )}
              
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - hidden on mobile unless open */}
        <div className={`${
          isMobileSidebarOpen ? "block" : "hidden"
        } md:block fixed md:relative z-20 inset-0 md:inset-auto bg-white md:w-64 shadow-md flex-shrink-0 h-full md:h-auto overflow-y-auto custom-scrollbar dark:bg-neutral-dark dark:text-neutral-light`}>
          <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>
        
        {/* Mobile sidebar backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-10 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Content Column */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-neutral-light dark:bg-neutral-dark dark:text-neutral-light">
            {children}
          </div>
          
          {/* Betting Slip Column */}
          <div className="w-full md:w-80 bg-white shadow-md flex-shrink-0 overflow-y-auto custom-scrollbar betting-slip-shadow dark:bg-neutral-dark dark:text-neutral-light">
            <BettingSlip />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
