import React from "react";
import { Link } from "wouter";
import { FaCreditCard, FaPaypal, FaBitcoin, FaApplePay, FaGooglePay } from "react-icons/fa";
import { SiVenmo, SiCashapp, SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";
import { Separator } from "@/components/ui/separator";
import weparlayLogo from "@assets/weparlaylogoP1.png";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white px-2 py-2 mt-auto">
      <div className="container mx-auto text-center">
        {/* Payment methods - smaller */}
        <div className="mt-1 mb-2 text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <SiVisa className="text-2xl text-blue-500" />
            <SiMastercard className="text-2xl text-orange-500" />
            <SiAmericanexpress className="text-2xl text-blue-400" />
            <SiDiscover className="text-2xl text-orange-600" />
            <FaPaypal className="text-2xl text-blue-600" />
            <FaBitcoin className="text-2xl text-yellow-500" />
            <FaCreditCard className="text-2xl text-gray-200" />
          </div>
        </div>

        <Separator className="bg-gray-800 my-1" />

        {/* Copyright and legal bottom bar */}
        <div className="flex flex-col items-center py-1">
          <div className="mb-1 text-center">
            <p className="text-gray-400 text-xs">
              © {currentYear} WeParlay.io All Rights Reserved.
            </p>
          </div>
          
          <div className="flex gap-4">
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