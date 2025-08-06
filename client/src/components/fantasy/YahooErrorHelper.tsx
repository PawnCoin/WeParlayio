import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Settings } from "lucide-react";

export default function YahooErrorHelper() {
  return (
    <Card className="bg-red-900/20 border-red-700/50">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Yahoo OAuth Configuration Issue
        </CardTitle>
        <CardDescription className="text-red-300">
          The "invalid_scope" error means your Yahoo app needs Fantasy Sports API enabled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-900/30 p-4 rounded-lg">
          <h4 className="text-red-300 font-medium mb-2">Required Fix:</h4>
          <ol className="text-red-200 text-sm space-y-1 list-decimal list-inside">
            <li>Go to Yahoo Developer Console</li>
            <li>Edit your WeParlay app</li>
            <li>Enable "Fantasy Sports" API permission</li>
            <li>Save and try connecting again</li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => window.open('https://developer.yahoo.com/apps/', '_blank')}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Yahoo Developer Console
          </Button>
          <Button 
            onClick={() => window.open('/YAHOO_OAUTH_SETUP_GUIDE.md', '_blank')}
            variant="outline" 
            className="border-red-500/50 text-red-400 hover:bg-red-900/20 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Setup Guide
          </Button>
        </div>

        <div className="text-xs text-red-300 bg-red-900/20 p-3 rounded">
          <p className="font-medium mb-1">What to look for in Yahoo Developer Console:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>"API Permissions" or "Product APIs" section</li>
            <li>Checkbox for "Fantasy Sports" - make sure it's checked</li>
            <li>Select "Read" access level for fspt-r scope</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}