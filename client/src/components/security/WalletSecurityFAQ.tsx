import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, KeyRound, Eye, EyeOff, AlertCircle, ExternalLink, Wallet, Check } from "lucide-react";

const WalletSecurityFAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqs = [
    {
      question: "How does WeParlay secure my wallet connection?",
      answer: (
        <div className="space-y-2">
          <p>WeParlay uses industry-standard security protocols to ensure your wallet connection is secure:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All wallet communications are encrypted using TLS/SSL</li>
            <li>We implement EIP-1193 and WalletConnect standards</li>
            <li>We never store your private keys on our servers</li>
            <li>All wallet requests require explicit approval from you</li>
          </ul>
        </div>
      ),
      tags: ["security", "encryption", "wallet", "connection"]
    },
    {
      question: "What information does WeParlay have access to when I connect my wallet?",
      answer: (
        <div className="space-y-2">
          <p>When you connect your wallet to WeParlay, we only have access to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your public wallet address</li>
            <li>Transaction history related to WeParlay</li>
            <li>Basic account balances (for supported tokens)</li>
          </ul>
          <p className="text-sm bg-primary/10 p-2 rounded-md mt-2">
            <Lock className="inline-block h-4 w-4 mr-1" /> We <strong>never</strong> have access to your:
            <ul className="list-disc pl-5 mt-1">
              <li>Private keys</li>
              <li>Seed phrases</li>
              <li>Passwords</li>
            </ul>
          </p>
        </div>
      ),
      tags: ["privacy", "data", "access", "permissions"]
    },
    {
      question: "Are my funds safe when using WeParlay?",
      answer: (
        <div className="space-y-2">
          <p>Your funds remain in your control when using WeParlay:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Funds remain in your wallet until you explicitly approve a transaction</li>
            <li>WeParlay can only request transactions, which you must approve</li>
            <li>All transaction details are transparently displayed before approval</li>
            <li>You can revoke WeParlay's connection to your wallet at any time</li>
          </ul>
          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Always review transaction details carefully before approving. Never share your seed phrase or private keys with anyone, including WeParlay support.
            </AlertDescription>
          </Alert>
        </div>
      ),
      tags: ["funds", "safety", "security", "transactions"]
    },
    {
      question: "How do I disconnect my wallet from WeParlay?",
      answer: (
        <div className="space-y-2">
          <p>You can disconnect your wallet in two ways:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>From WeParlay:</strong> Go to Wallet Management and click "Disconnect" next to your wallet
            </li>
            <li>
              <strong>From your wallet:</strong> Open your wallet extension and remove WeParlay from connected sites
            </li>
          </ol>
          <div className="flex flex-col space-y-2 mt-3">
            <p className="font-medium">Common wallet disconnection paths:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-md border">
                <strong>MetaMask:</strong> Settings → Connections → Find WeParlay → Disconnect
              </div>
              <div className="p-2 rounded-md border">
                <strong>Phantom:</strong> Settings → Connected Apps → Find WeParlay → Disconnect
              </div>
              <div className="p-2 rounded-md border">
                <strong>Coinbase Wallet:</strong> Settings → Connections → Find WeParlay → Disconnect
              </div>
              <div className="p-2 rounded-md border">
                <strong>Trust Wallet:</strong> Settings → Connections → Find WeParlay → Disconnect
              </div>
            </div>
          </div>
        </div>
      ),
      tags: ["disconnect", "remove", "revoke", "access"]
    },
    {
      question: "What happens if someone gains access to my device?",
      answer: (
        <div className="space-y-2">
          <p>If someone gains access to your device:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>They would still need your wallet password/PIN to authorize transactions</li>
            <li>Most wallets lock automatically after a period of inactivity</li>
            <li>If you use hardware wallets like Ledger or Trezor, physical confirmation is required</li>
          </ul>
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-red-800 dark:text-red-300 text-sm mt-3">
            <p className="font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              If your device is compromised:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Immediately disconnect your wallet from all sites</li>
              <li>Transfer your funds to a secure wallet</li>
              <li>Change your wallet password</li>
              <li>Contact WeParlay support for account security assistance</li>
            </ol>
          </div>
        </div>
      ),
      tags: ["device", "compromise", "security", "unauthorized"]
    },
    {
      question: "How can I tell if a transaction is legitimate?",
      answer: (
        <div className="space-y-2">
          <p>Before approving any transaction, verify these details:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Confirm that the website URL is <strong>weparlay.io</strong> (check for typos)</li>
            <li>Verify the exact amount being transacted</li>
            <li>Check the recipient address matches WeParlay's official addresses</li>
            <li>Review the network fee (unusually high fees can be suspicious)</li>
            <li>Ensure the smart contract interaction is with verified WeParlay contracts</li>
          </ol>
          <div className="mt-3 text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-md text-green-800 dark:text-green-300">
            <p className="font-medium flex items-center">
              <Check className="h-4 w-4 mr-2" />
              WeParlay will always:
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>Show a detailed transaction preview before requesting wallet approval</li>
              <li>Allow you to cancel any transaction before confirming</li>
              <li>Use verified and audited smart contracts</li>
            </ul>
          </div>
        </div>
      ),
      tags: ["transaction", "verification", "legitimate", "approval"]
    },
    {
      question: "Which networks and wallets are supported by WeParlay?",
      answer: (
        <div className="space-y-2">
          <p>WeParlay supports the following blockchain networks and wallets:</p>
          
          <p className="font-medium mt-3">Supported Networks:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ethereum Mainnet</li>
            <li>Polygon</li>
            <li>Optimism</li>
            <li>Arbitrum</li>
            <li>Base</li>
            <li>Solana</li>
          </ul>
          
          <p className="font-medium mt-3">Supported Wallets:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm mt-1">MetaMask</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm mt-1">Phantom</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm mt-1">Coinbase</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm mt-1">Trust Wallet</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3">
            We regularly add support for new networks and wallets. Check our announcements for updates.
          </p>
        </div>
      ),
      tags: ["networks", "wallets", "supported", "compatibility"]
    },
    {
      question: "What should I do if I notice suspicious activity?",
      answer: (
        <div className="space-y-3">
          <p>If you notice any suspicious activity, take these steps immediately:</p>
          
          <ol className="list-decimal pl-5 space-y-1">
            <li>Disconnect your wallet from WeParlay and all other sites</li>
            <li>Transfer your remaining funds to a secure wallet</li>
            <li>Change your wallet password/PIN</li>
            <li>Enable additional security measures like hardware key authentication</li>
            <li>Contact WeParlay support at <strong>security@weparlay.io</strong></li>
          </ol>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning Signs of Suspicious Activity</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                <li>Transactions you don't recognize</li>
                <li>Session activity from unknown locations</li>
                <li>Wallet connection requests when you're not using the site</li>
                <li>Unusual emails claiming to be from WeParlay</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <p className="text-sm bg-primary/10 p-2 rounded-md mt-2">
            WeParlay has a dedicated security team monitoring for suspicious activities 24/7. We will never ask for your private keys, seed phrase, or wallet password.
          </p>
        </div>
      ),
      tags: ["suspicious", "activity", "security", "protection"]
    },
    {
      question: "Does WeParlay have insurance for crypto assets?",
      answer: (
        <div className="space-y-2">
          <p>WeParlay employs multiple layers of protection for your assets:</p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>WeParlay maintains insurance coverage for certain on-platform assets</li>
            <li>Our insurance policy covers specific security incidents like smart contract failures</li>
            <li>We maintain a security fund to address unexpected issues</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-amber-800 dark:text-amber-300 text-sm mt-3">
            <p className="font-medium">Important Limitations:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Insurance does not cover losses due to user error or compromised wallets</li>
              <li>The policy has specific coverage limits</li>
              <li>Not all assets or networks are covered by insurance</li>
            </ul>
          </div>
          
          <p className="mt-3">
            For detailed information on our insurance coverage, please review our{" "}
            <a 
              href="/terms-of-service" 
              className="text-primary hover:underline inline-flex items-center"
            >
              Terms of Service
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </p>
        </div>
      ),
      tags: ["insurance", "protection", "coverage", "assets"]
    },
    {
      question: "How does WeParlay protect against smart contract vulnerabilities?",
      answer: (
        <div className="space-y-2">
          <p>We implement multiple layers of protection against smart contract vulnerabilities:</p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Audits:</strong> All smart contracts are audited by leading security firms including CertiK, Trail of Bits, and ChainSecurity
            </li>
            <li>
              <strong>Bug Bounty Program:</strong> We maintain an active bug bounty program to incentivize responsible disclosure of security issues
            </li>
            <li>
              <strong>Time-Locked Administration:</strong> Critical contract changes require a time-delay, allowing users to withdraw funds if they don't agree with changes
            </li>
            <li>
              <strong>Formal Verification:</strong> Critical components undergo mathematical verification to prove correctness
            </li>
          </ul>
          
          <div className="mt-3 flex items-start p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
            <KeyRound className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium">Our Smart Contract Security Measures:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Rate limiting to prevent flash loan attacks</li>
                <li>Emergency pause functionality for critical emergencies</li>
                <li>Upgradeable architecture with governance approval</li>
                <li>Multi-signature requirements for admin functions</li>
              </ul>
              <p className="mt-2">
                You can view our latest audit reports and security documentation on our{" "}
                <a 
                  href="https://github.com/weparlay/smart-contracts"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline inline-flex items-center"
                >
                  GitHub repository
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </p>
            </div>
          </div>
        </div>
      ),
      tags: ["smart contracts", "vulnerabilities", "security", "audits"]
    }
  ];
  
  // Filter FAQs based on search term
  const filteredFaqs = searchTerm.trim() === "" 
    ? faqs 
    : faqs.filter(faq => {
        const searchLower = searchTerm.toLowerCase();
        return (
          faq.question.toLowerCase().includes(searchLower) || 
          faq.tags.some(tag => tag.includes(searchLower))
        );
      });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Wallet Security FAQ
        </CardTitle>
        <CardDescription>
          Learn about our security measures to protect your cryptocurrency
        </CardDescription>
        
        <div className="mt-2">
          <Input
            placeholder="Search security topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <div className="rounded-full bg-muted w-12 h-12 mx-auto flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No Results Found</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              We couldn't find any FAQ entries matching "{searchTerm}". Try a different search term or check our help center for more information.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        <div className="pt-6 border-t mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <p>Need more help with wallet security?</p>
            <p>Contact our support team at <strong>support@weparlay.io</strong></p>
          </div>
          
          <Button variant="outline" className="sm:ml-auto">
            View Security Center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Adding Search icon
const Search = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default WalletSecurityFAQ;