import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

const YahooAuthDemo: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<{
    connected: boolean;
    user?: string;
    error?: string;
  }>({ connected: false });

  useEffect(() => {
    // Check URL params for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const yahooConnected = urlParams.get('yahoo_connected');
    const user = urlParams.get('user');
    const error = urlParams.get('error');

    if (yahooConnected === 'true') {
      setAuthStatus({ connected: true, user: user || 'Yahoo User' });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setAuthStatus({ connected: false, error: error });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleYahooLogin = () => {
    window.location.href = '/api/yahoo/login';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            Y!
          </div>
          Yahoo Fantasy Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus.connected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">Connected to Yahoo Fantasy</span>
            </div>
            <div className="text-sm text-gray-600">
              User: {authStatus.user}
            </div>
            <Badge variant="default" className="bg-green-600">
              Authentication Successful
            </Badge>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Yahoo Fantasy API access tokens have been received and stored in session.
              The authentication flow is working correctly.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Not connected to Yahoo Fantasy</span>
            </div>
            
            {authStatus.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {authStatus.error.replace(/_/g, ' ')}
              </div>
            )}

            <Button 
              onClick={handleYahooLogin}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Yahoo OAuth Flow
            </Button>

            <div className="text-xs text-gray-500">
              This will redirect to Yahoo's authentication page and test the complete OAuth flow.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YahooAuthDemo;