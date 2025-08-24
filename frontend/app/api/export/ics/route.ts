import { NextRequest, NextResponse } from "next/server";
import { generateICS } from "@/lib/adapters/calendar";
import { ParsedEvent } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const syllabusId = searchParams.get("id");
    const title = searchParams.get("title") || "Course Events";

    if (!syllabusId) {
      return NextResponse.json(
        { error: "Syllabus ID is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch events from database using syllabusId
    // For now, return mock data
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
      }
    ];

    const icsContent = generateICS(mockEvents, title);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, '_')}_events.ics"`,
      },
    });
  } catch (error) {
    console.error("ICS export error:", error);
    return NextResponse.json(
      { error: "Failed to generate ICS file" },
      { status: 500 }
    );
  }
}
