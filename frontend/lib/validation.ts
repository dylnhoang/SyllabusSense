import { z } from "zod";

// Parsed event schema
export const ParsedEventSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  type: z.enum(["Lecture", "Exam", "Assignment", "Other"]),
});

export type ParsedEvent = z.infer<typeof ParsedEventSchema>;

// Syllabus schema
export const SyllabusSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  term: z.string().min(1, "Term is required"),
  uploadedAt: z.string().datetime(),
  events: z.array(ParsedEventSchema),
});

export type Syllabus = z.infer<typeof SyllabusSchema>;

// Upload form schema
export const UploadFormSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size > 0,
    "Please select a file"
  ).refine(
    (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
    "File must be PDF or DOCX"
  ),
});

export type UploadFormData = z.infer<typeof UploadFormSchema>;

// Event edit schema
export const EventEditSchema = ParsedEventSchema.partial().omit({ id: true });

export type EventEditData = z.infer<typeof EventEditSchema>;

// Bulk edit schema
export const BulkEditSchema = z.object({
  type: z.enum(["Lecture", "Exam", "Assignment", "Other"]).optional(),
  shiftDays: z.number().int().min(-365).max(365).optional(),
});

export type BulkEditData = z.infer<typeof BulkEditSchema>;
