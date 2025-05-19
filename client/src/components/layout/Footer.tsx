import React from "react";
import { Link } from "wouter";
import { FaCreditCard, FaPaypal, FaBitcoin, FaApplePay, FaGooglePay } from "react-icons/fa";
import { SiVenmo, SiCashapp, SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";
import { Separator } from "@/components/ui/separator";
import weparlayLogo from "@assets/weparlaylogoP1.png";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white px-4 py-4 mt-auto">
      <div className="container mx-auto text-center">
        {/* Logo centered and enlarged */}
        <div className="mb-4 flex justify-center">
          <img src={weparlayLogo} alt="WeParlay.io" className="h-28" />
        </div>

        {/* Payment methods - smaller */}
        <div className="mt-2 mb-3 text-center">
          <h3 className="text-sm font-bold mb-2">Payment Methods</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <SiVisa className="text-3xl text-blue-500" />
            <SiMastercard className="text-3xl text-orange-500" />
            <SiAmericanexpress className="text-3xl text-blue-400" />
            <SiDiscover className="text-3xl text-orange-600" />
            <FaPaypal className="text-3xl text-blue-600" />
            <FaBitcoin className="text-3xl text-yellow-500" />
            <FaCreditCard className="text-3xl text-gray-200" />
            <FaApplePay className="text-3xl text-white" />
            <FaGooglePay className="text-3xl text-white" />
          </div>
        </div>

        <Separator className="bg-gray-800 my-2" />

        {/* Copyright and legal bottom bar */}
        <div className="flex flex-col items-center">
          <div className="mb-2 text-center">
            <p className="text-gray-400 text-xs">
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