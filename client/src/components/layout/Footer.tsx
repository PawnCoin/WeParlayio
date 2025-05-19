import React from "react";
import { Link } from "wouter";
import { FaCreditCard, FaPaypal, FaBitcoin, FaApplePay, FaGooglePay } from "react-icons/fa";
import { SiVenmo, SiCashapp, SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";
import { Separator } from "@/components/ui/separator";
import weparlayLogo from "@assets/weparlaylogoP1.png";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white px-4 py-8 mt-auto">
      <div className="container mx-auto text-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and about */}
          <div className="col-span-1">
            <div className="mb-4 flex justify-center">
              <img src={weparlayLogo} alt="WeParlay.io" className="h-16" />
            </div>
            <p className="text-gray-400 text-sm">
              WeParlay is your premier platform for sports betting with enhanced security, 
              social features, and comprehensive user protection.
            </p>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Home</span></Link></li>
              <li><Link href="/live-betting"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Live Betting</span></Link></li>
              <li><Link href="/tournaments"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Tournaments</span></Link></li>
              <li><Link href="/fantasy-sports"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Fantasy Sports</span></Link></li>
              <li><Link href="/video-gaming"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Video Gaming</span></Link></li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms-of-service"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Terms of Service</span></Link></li>
              <li><Link href="/privacy-policy"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Privacy Policy</span></Link></li>
              <li><Link href="/security-info"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Security Information</span></Link></li>
              <li><Link href="/responsible-gaming"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Responsible Gaming</span></Link></li>
              <li><Link href="/compliance"><span className="text-gray-400 hover:text-green-500 transition-colors text-sm">Compliance</span></Link></li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Email: support@weparlay.io</li>
              <li className="text-gray-400 text-sm">Support Hours: 24/7</li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <SiVisa className="text-3xl text-blue-500" />
            <SiMastercard className="text-3xl text-orange-500" />
            <SiAmericanexpress className="text-3xl text-blue-400" />
            <SiDiscover className="text-3xl text-orange-600" />
            <FaPaypal className="text-3xl text-blue-600" />
            <FaBitcoin className="text-3xl text-yellow-500" />
            <FaCreditCard className="text-3xl text-gray-200" />
            <FaApplePay className="text-3xl text-white" />
            <FaGooglePay className="text-3xl text-white" />
            <SiVenmo className="text-3xl text-blue-300" />
            <SiCashapp className="text-3xl text-green-500" />
          </div>
        </div>

        <Separator className="bg-gray-800 my-6" />

        {/* Copyright and legal bottom bar */}
        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} WeParlay.io All Rights Reserved.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Gambling involves risk. Please gamble responsibly.
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link href="/terms-of-service">
              <span className="text-gray-400 hover:text-green-500 transition-colors text-xs">Terms</span>
            </Link>
            <Link href="/privacy-policy">
              <span className="text-gray-400 hover:text-green-500 transition-colors text-xs">Privacy</span>
            </Link>
            <Link href="/security-info">
              <span className="text-gray-400 hover:text-green-500 transition-colors text-xs">Security</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;