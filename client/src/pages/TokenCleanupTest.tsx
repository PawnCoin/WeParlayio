import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearInvalidTokens } from "@/utils/tokenCleaner";

export default function TokenCleanupTest() {
  const handleClearTokens = () => {
    clearInvalidTokens();
    console.log('Tokens cleared');
    window.location.reload();
  };

  const checkLocalStorage = () => {
    const tokens = {
      'auth-token': localStorage.getItem('auth-token'),
      'weparlay-admin-token': localStorage.getItem('weparlay-admin-token'),
      'user': localStorage.getItem('user'),
      'weparlay-is-admin': localStorage.getItem('weparlay-is-admin'),
      'weparlay-logged-in': localStorage.getItem('weparlay-logged-in')
    };
    
    console.log('Current localStorage tokens:', tokens);
    return tokens;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Token Cleanup Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleClearTokens}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Clear Invalid Tokens
            </Button>
            
            <Button 
              onClick={checkLocalStorage}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Check LocalStorage (See Console)
            </Button>
            
            <div className="p-4 bg-slate-700 rounded">
              <h3 className="font-semibold mb-2">Current Issue:</h3>
              <p className="text-sm text-slate-300">
                The app has "site-owner-admin-token" stored which is not a valid JWT.
                This is causing authentication failures.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}