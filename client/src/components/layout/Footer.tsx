import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-0.5 mt-auto">
      <div className="container mx-auto px-2">
        <div className="flex flex-col md:flex-row items-center justify-center">
          {/* Quick Links */}
          <div className="flex gap-4 mb-0 md:mb-0">
            <Link href="/about">
              <span className="text-gray-300 hover:text-green-500 transition-colors text-sm">About</span>
            </Link>
            <Link href="/support">
              <span className="text-gray-300 hover:text-green-500 transition-colors text-sm">Support</span>
            </Link>
            <Link href="/contact">
              <span className="text-gray-300 hover:text-green-500 transition-colors text-sm">Contact</span>
            </Link>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-col items-center">
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                © {currentYear} WeParlay.io All Rights Reserved.
              </p>
            </div>
            
            <div className="flex gap-3 mt-0">
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
      </div>
    </footer>
  );
};

export default Footer;