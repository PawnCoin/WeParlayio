import React from 'react';
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ThemeSettingsPage() {
  // Redirect to user profile themes
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Theme Settings Moved</h1>
      <p className="text-muted-foreground mb-8">
        Theme settings are now part of your user profile for better privacy and organization.
      </p>
      <p className="text-sm text-gray-500">
        Please access your theme settings through your user profile.
      </p>
      
      
    </div>
  );
}