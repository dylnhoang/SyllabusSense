"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { EventsTable } from "@/components/events-table";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { ParsedEvent } from "@/lib/validation";
import { generateICS, exportToGoogleCalendar } from "@/lib/adapters/calendar";
import { downloadICS } from "@/lib/utils";
import { ArrowLeft, Download, Calendar, Settings, Edit3 } from "lucide-react";
import Link from "next/link";

// Mock data - in real app this would come from API
const mockEvents: ParsedEvent[] = [
  {
    id: "1",
    date: "2024-09-02",
    title: "Course Introduction",
    notes: "Overview of course structure and expectations",
    type: "Lecture"
  },
  {
    id: "2",
    date: "2024-09-09",
    title: "Fundamentals Review",
    notes: "Review of prerequisite concepts",
    type: "Lecture"
  },
  {
    id: "3",
    date: "2024-09-16",
    title: "Midterm Exam",
    notes: "Covers chapters 1-5",
    type: "Exam"
  },
  {
    id: "4",
    date: "2024-09-23",
    title: "Assignment 1 Due",
    notes: "Submit via Canvas",
    type: "Assignment"
  },
  {
    id: "5",
    date: "2024-10-07",
    title: "Guest Speaker",
    notes: "Industry professional presentation",
    type: "Other"
  }
];

export default function SyllabusPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syllabusTitle, setSyllabusTitle] = useState("Course Syllabus");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleExportICS = () => {
    try {
      const icsContent = generateICS(events, syllabusTitle);
      const filename = `${syllabusTitle.replace(/\s+/g, '_')}_events.ics`;
      downloadICS(icsContent, filename);
      
      addToast({
        title: "Export successful!",
        description: "ICS file has been downloaded to your device.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Export failed",
        description: "There was an error generating the ICS file. Please try again.",
        type: "error",
      });
    }
  };

  const handleExportGoogle = async () => {
    try {
      addToast({
        title: "Connecting to Google Calendar...",
        description: "Please complete the authentication process.",
        type: "default",
      });

      const success = await exportToGoogleCalendar(events, syllabusTitle);
      
      if (success) {
        addToast({
          title: "Export successful!",
          description: "Events have been added to your Google Calendar.",
          type: "success",
        });
      } else {
        addToast({
          title: "Export failed",
          description: "There was an error adding events to Google Calendar. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Export failed",
        description: "There was an error connecting to Google Calendar. Please try again.",
        type: "error",
      });
    }
  };

  const handleEditEvent = (eventId: string) => {
    // TODO: Implement inline editing
    addToast({
      title: "Edit feature",
      description: "Inline editing will be available in the next update.",
      type: "info",
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
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {syllabusTitle}
              </h1>
              <p className="text-muted-foreground">
                {events.length} events • Last updated {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Syllabus
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Export section */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Export to Calendar
              </h2>
              <p className="text-sm text-muted-foreground">
                Download an ICS file or sync directly with Google Calendar
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleExportICS} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download ICS
              </Button>
              <Button onClick={handleExportGoogle}>
                <Calendar className="w-4 h-4 mr-2" />
                Export to Google
              </Button>
            </div>
          </div>
        </div>

        {/* Events table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Course Events
            </h2>
            <div className="text-sm text-muted-foreground">
              {events.length} total events
            </div>
          </div>
          
          <EventsTable
            events={events}
            onExportICS={handleExportICS}
            onExportGoogle={handleExportGoogle}
            isLoading={isLoading}
          />
        </div>

        {/* Help section */}
        <div className="mt-16 max-w-2xl">
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">
              Need help with your events?
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Use the search and filter options above to find specific events
              </p>
              <p>
                • Click the edit button on any event to modify details
              </p>
              <p>
                • Export to ICS for use with Apple Calendar, Outlook, or other apps
              </p>
              <p>
                • Connect your Google Calendar for automatic syncing
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
