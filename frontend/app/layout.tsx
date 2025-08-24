import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastAnnouncer } from "@/components/toast-announcer";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyllabusSense - Intelligent Syllabus Management",
  description: "Upload, parse, and export your course syllabi to calendar with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastAnnouncer />
          <KeyboardShortcuts />
        </ThemeProvider>
      </body>
    </html>
  );
}
