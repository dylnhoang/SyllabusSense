"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { FileDropzone } from "@/components/file-dropzone";
import { UploadProgress } from "@/components/upload-progress";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { parseSyllabus } from "@/lib/adapters/uploads";
import { ArrowLeft, CheckCircle, AlertCircle, Upload } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const { addToast, uploadProgress, isUploading, setUploadProgress, setIsUploading } = useUIStore();
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleUploadStart = async (file: File) => {
    try {
      setUploadedFile(file);
      setIsUploading(true);
      setUploadStatus("Uploading file...");
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setUploadStatus("Processing syllabus...");
      setIsProcessing(true);
      
      // Parse the syllabus
      const result = await parseSyllabus(file);
      
      addToast({
        title: "Upload successful!",
        description: `Parsed ${result.events.length} events from your syllabus.`,
        type: "success",
      });
      
      // Redirect to the syllabus review page
      router.push(`/syllabus/${result.syllabusId}`);
      
    } catch (error) {
      console.error("Upload failed:", error);
      addToast({
        title: "Upload failed",
        description: "There was an error processing your syllabus. Please try again.",
        type: "error",
      });
      setUploadStatus("Upload failed");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleUploadError = (error: string) => {
    addToast({
      title: "Upload error",
      description: error,
      type: "error",
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
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Upload Syllabus
            </h1>
                          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your course syllabus and we&apos;ll automatically extract all the important dates, 
                assignments, and events. Supported formats: PDF and DOCX.
              </p>
          </div>
        </div>

        {/* Upload area */}
        <div className="max-w-2xl mx-auto">
          {!isUploading && !isProcessing ? (
            <div className="space-y-6">
              <FileDropzone
                onUploadStart={handleUploadStart}
                onError={handleUploadError}
              />
              
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  What happens next?
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-medium">1</span>
                    </div>
                    <p>We&apos;ll analyze your syllabus and extract all calendar events</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-medium">2</span>
                    </div>
                    <p>Review and edit the extracted events in our table view</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-medium">3</span>
                    </div>
                    <p>Export to your calendar or sync with Google Calendar</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border rounded-lg p-8 text-center">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Processing your syllabus
                  </h3>
                                <p className="text-muted-foreground">
                This usually takes a few seconds&hellip;
              </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Uploading...
                  </h3>
                  <UploadProgress progress={uploadProgress} status={uploadStatus} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">
              Tips for best results
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use clear, well-formatted documents for better parsing accuracy</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ensure dates are in a consistent format (MM/DD/YYYY or similar)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include course titles and event descriptions for better organization</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Large files may take longer to process</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
