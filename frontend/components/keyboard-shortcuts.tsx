"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { Button } from "./ui/button";
import { X, Keyboard } from "lucide-react";

export function KeyboardShortcuts() {
  const { showKeyboardShortcuts, toggleKeyboardShortcuts } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // TODO: Focus search input
        console.log("Focus search");
      }
      
      // Cmd/Ctrl + / for keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggleKeyboardShortcuts();
      }
      
      // Escape to close modals
      if (e.key === "Escape") {
        if (showKeyboardShortcuts) {
          toggleKeyboardShortcuts();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showKeyboardShortcuts, toggleKeyboardShortcuts]);

  if (!showKeyboardShortcuts) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-950 border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleKeyboardShortcuts}
            aria-label="Close keyboard shortcuts"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">Navigation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Upload</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘U</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Dashboard</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘D</kbd>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">Table Actions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Edit cell</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">E</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Save row</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Select row</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Close</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
