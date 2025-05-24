import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "../contexts/OnboardingContext";
import { RotateCcw, Play, CheckCircle, Users } from "lucide-react";

export default function OnboardingDemo() {
  const { resetOnboarding, onboardingData, isNewUser } = useOnboarding();

  const handleTestOnboarding = () => {
    // Clear existing data to trigger onboarding for demo
    localStorage.removeItem('weparlay-onboarding-completed');
    localStorage.removeItem('weparlay-user-data');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('weparlay-demo-user');
    
    // Trigger page reload to activate onboarding
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent mb-4">
          Interactive Onboarding Wizard Demo
        </h1>
        <p className="text-gray-600 text-lg">
          Test the complete new user onboarding experience
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-500" />
              Test Onboarding Flow
            </CardTitle>
            <CardDescription>
              Experience the 5-step interactive wizard that guides new users through platform setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Onboarding Includes:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Personal information & experience level</li>
                  <li>• Sports & betting preferences</li>
                  <li>• Notification & privacy settings</li>
                  <li>• Payment method setup</li>
                  <li>• Security configuration</li>
                </ul>
              </div>

              <Button 
                onClick={handleTestOnboarding}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Onboarding Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Current Status
            </CardTitle>
            <CardDescription>
              Your current onboarding and user data status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Is New User:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  isNewUser ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isNewUser ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Onboarding Status:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  onboardingData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {onboardingData ? 'Completed' : 'Not Started'}
                </span>
              </div>

              {onboardingData && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed Setup
                  </h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Name:</strong> {onboardingData.personalInfo?.displayName || 'Not set'}</p>
                    <p><strong>Experience:</strong> {onboardingData.personalInfo?.experience || 'Not set'}</p>
                    <p><strong>Sports:</strong> {onboardingData.preferences?.sports?.length || 0} selected</p>
                    <p><strong>Payment:</strong> {onboardingData.account?.depositMethod || 'Not set'}</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={resetOnboarding}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Onboarding Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            The Interactive Onboarding Wizard automatically appears for new users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-1">Personal Info</h4>
              <p className="text-sm text-gray-600">Display name, experience level, favorite teams</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-1">Preferences</h4>
              <p className="text-sm text-gray-600">Sports, bet types, and interests</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-1">Notifications</h4>
              <p className="text-sm text-gray-600">Email, SMS, and privacy settings</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold mb-1">Funding</h4>
              <p className="text-sm text-gray-600">Payment methods and initial deposit</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 font-bold">5</span>
              </div>
              <h4 className="font-semibold mb-1">Security</h4>
              <p className="text-sm text-gray-600">Two-factor auth and final setup</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            What makes this onboarding experience special
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">User Experience</h4>
              <ul className="space-y-2 text-sm">
                <li>• Progressive multi-step wizard</li>
                <li>• Visual progress tracking</li>
                <li>• Smart form validation</li>
                <li>• Responsive mobile design</li>
                <li>• Skip option for quick access</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Data Collection</h4>
              <ul className="space-y-2 text-sm">
                <li>• Personalized experience setup</li>
                <li>• Payment method configuration</li>
                <li>• Notification preferences</li>
                <li>• Security settings</li>
                <li>• Automatic data persistence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}