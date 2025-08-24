import { describe, it, expect } from 'vitest';
import { ParsedEventSchema, SyllabusSchema, UploadFormSchema } from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('ParsedEventSchema', () => {
    it('should validate a valid event', () => {
      const validEvent = {
        id: '1',
        date: '2024-09-02',
        title: 'Course Introduction',
        notes: 'Overview of course structure',
        type: 'Lecture' as const,
      };

      const result = ParsedEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidEvent = {
        id: '1',
        date: '09/02/2024', // Invalid format
        title: 'Course Introduction',
        type: 'Lecture' as const,
      };

      const result = ParsedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format');
      }
    });

    it('should reject empty title', () => {
      const invalidEvent = {
        id: '1',
        date: '2024-09-02',
        title: '',
        type: 'Lecture' as const,
      };

      const result = ParsedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject invalid event type', () => {
      const invalidEvent = {
        id: '1',
        date: '2024-09-02',
        title: 'Course Introduction',
        type: 'InvalidType' as any,
      };

      const result = ParsedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('SyllabusSchema', () => {
    it('should validate a valid syllabus', () => {
      const validSyllabus = {
        id: '1',
        title: 'Introduction to Computer Science',
        term: 'Fall 2024',
        uploadedAt: '2024-08-15T10:00:00Z',
        events: [],
      };

      const result = SyllabusSchema.safeParse(validSyllabus);
      expect(result.success).toBe(true);
    });

    it('should reject syllabus without title', () => {
      const invalidSyllabus = {
        id: '1',
        title: '',
        term: 'Fall 2024',
        uploadedAt: '2024-08-15T10:00:00Z',
        events: [],
      };

      const result = SyllabusSchema.safeParse(invalidSyllabus);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });
  });

  describe('UploadFormSchema', () => {
    it('should validate a valid file', () => {
      const validFile = new File(['content'], 'syllabus.pdf', {
        type: 'application/pdf',
      });

      const result = UploadFormSchema.safeParse({ file: validFile });
      expect(result.success).toBe(true);
    });

    it('should reject non-PDF/DOCX files', () => {
      const invalidFile = new File(['content'], 'syllabus.txt', {
        type: 'text/plain',
      });

      const result = UploadFormSchema.safeParse({ file: invalidFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File must be PDF or DOCX');
      }
    });

    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.pdf', {
        type: 'application/pdf',
      });

      const result = UploadFormSchema.safeParse({ file: emptyFile });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a file');
      }
    });
  });
});
