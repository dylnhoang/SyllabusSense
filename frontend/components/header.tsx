"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, User, Settings, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useTheme } from "next-themes";

interface HeaderProps {
  showSearch?: boolean;
  showUserMenu?: boolean;
}

export function Header({ showSearch = true, showUserMenu = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { addToast } = useUIStore();

  const handleSignOut = () => {
    // TODO: Implement actual sign out
    addToast({
      title: "Signed out",
      description: "You have been successfully signed out.",
      type: "success",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-xl">SyllabusSense</span>
          </Link>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search syllabi..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "system" && <Monitor className="h-4 w-4" />}
          </Button>

          {/* User menu */}
          {showUserMenu && (
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="User menu">
                <User className="h-4 w-4" />
              </Button>
              
              {/* Dropdown menu would go here */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-md shadow-lg opacity-0 pointer-events-none transition-opacity">
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
