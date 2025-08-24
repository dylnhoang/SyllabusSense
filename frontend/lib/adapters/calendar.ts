import { ParsedEvent } from "../validation";

export function generateICS(events: ParsedEvent[], title: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SyllabusSense//Calendar Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${title}`,
    `X-WR-CALDESC:Course schedule exported from SyllabusSense`,
  ];

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const eventDateStr = eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    ics.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@syllabussense.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`,
      `SUMMARY:${event.title}`,
      event.notes ? `DESCRIPTION:${event.notes.replace(/\n/g, "\\n")}` : "",
      `CATEGORIES:${event.type}`,
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  
  return ics.join("\r\n");
}

export async function exportToGoogleCalendar(events: ParsedEvent[], title: string): Promise<boolean> {
  // Mock implementation - in real app this would use Google Calendar API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success/failure
  return Math.random() > 0.1; // 90% success rate
}

export function getGoogleAuthUrl(): string {
  // Mock OAuth URL - in real app this would be the actual Google OAuth URL
  return "https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=mock&scope=https://www.googleapis.com/auth/calendar.events&response_type=code";
}
