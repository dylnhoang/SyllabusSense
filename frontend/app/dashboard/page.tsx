"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Calendar, FileText, Clock } from "lucide-react";
import { useUIStore } from "@/lib/store";

// Mock data for demonstration
const mockSyllabi = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    term: "Fall 2024",
    uploadedAt: "2024-08-15T10:00:00Z",
    eventCount: 45,
  },
  {
    id: "2",
    title: "Advanced Mathematics",
    term: "Fall 2024",
    uploadedAt: "2024-08-10T14:30:00Z",
    eventCount: 32,
  },
  {
    id: "3",
    title: "English Literature",
    term: "Fall 2024",
    uploadedAt: "2024-08-05T09:15:00Z",
    eventCount: 28,
  },
];

export default function DashboardPage() {
  const { addToast } = useUIStore();

  const handleUploadClick = () => {
    // This would typically navigate to upload page
    addToast({
      title: "Upload feature",
      description: "Navigate to the upload page to add a new syllabus.",
      type: "default",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to SyllabusSense
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your course syllabi and automatically generate calendar events. 
            Export to your preferred calendar app with just a few clicks.
          </p>
        </div>

        {/* Upload CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8 mb-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload your first syllabus and see how easy it is to organize your course schedule.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/upload">
                <Plus className="w-5 h-5 mr-2" />
                Upload Syllabus
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent syllabi */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Recent Syllabi
            </h2>
            <Button variant="outline" asChild>
              <Link href="/upload">View All</Link>
            </Button>
          </div>

          {mockSyllabi.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockSyllabi.map((syllabus) => (
                <div
                  key={syllabus.id}
                  className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {syllabus.term}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {syllabus.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{syllabus.eventCount} events</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(syllabus.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/syllabus/${syllabus.id}`}>
                      View Events
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No syllabi yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Upload your first syllabus to get started with SyllabusSense.
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Syllabus
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Upload</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your PDF or DOCX syllabus files
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Review</h3>
            <p className="text-sm text-muted-foreground">
              Edit and organize your parsed calendar events
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Export</h3>
            <p className="text-sm text-muted-foreground">
              Download ICS files or sync with Google Calendar
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
