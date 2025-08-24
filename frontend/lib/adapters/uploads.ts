import { ParsedEvent } from "../validation";

// Mock parser that simulates processing time
export async function parseSyllabus(file: File): Promise<{ syllabusId: string; events: ParsedEvent[] }> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock events based on file name
  const events: ParsedEvent[] = [
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

  return {
    syllabusId: `syllabus-${Date.now()}`,
    events
  };
}

export async function uploadFile(file: File): Promise<string> {
  // Simulate upload time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock file ID
  return `file-${Date.now()}`;
}
