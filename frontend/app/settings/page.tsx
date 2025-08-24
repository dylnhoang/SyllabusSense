"use client";

import React from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { 
  ArrowLeft, 
  Calendar, 
  Moon, 
  Sun, 
  Monitor, 
  Link as LinkIcon, 
  Unlink,
  User,
  Mail,
  Shield,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { addToast } = useUIStore();
  const [isGoogleConnected, setIsGoogleConnected] = React.useState(false);

  const handleGoogleConnect = () => {
    if (isGoogleConnected) {
      setIsGoogleConnected(false);
      addToast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
        type: "success",
      });
    } else {
      setIsGoogleConnected(true);
      addToast({
        title: "Connected",
        description: "Successfully connected to Google Calendar.",
        type: "success",
      });
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    addToast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme.`,
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and integrations
            </p>
          </div>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Account Settings */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Account</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account information
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm text-muted-foreground">user@example.com</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Account Type</span>
                </div>
                <span className="text-sm text-muted-foreground">Free</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Support</span>
                </div>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your external services
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-foreground">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Sync your syllabus events directly to Google Calendar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-muted-foreground">
                      {isGoogleConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleGoogleConnect}
                    variant={isGoogleConnected ? "outline" : "default"}
                    size="sm"
                  >
                    {isGoogleConnected ? (
                      <>
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-foreground">Microsoft Outlook</h3>
                    <p className="text-sm text-muted-foreground">
                      Sync with Outlook Calendar (coming soon)
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                  Customize how SyllabusSense looks
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      theme === "light"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 hover:bg-muted/50"
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      theme === "dark"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 hover:bg-muted/50"
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      theme === "system"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 hover:bg-muted/50"
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Data & Privacy</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your data and privacy settings
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium text-foreground">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in a portable format
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium text-foreground">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
