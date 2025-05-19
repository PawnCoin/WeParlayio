import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-1 mt-auto">
      <div className="container mx-auto text-center">
        {/* Copyright and legal links */}
        <div className="flex flex-col items-center">
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              © {currentYear} WeParlay.io All Rights Reserved.
            </p>
          </div>
          
          <div className="flex gap-4 mt-1">
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