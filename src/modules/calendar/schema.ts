import { z } from 'zod';

export const calendarEventInsertSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  meetingId: z.string().optional(),
  type: z.enum(['meeting', 'event']).default('event'),
});

export const calendarEventUpdateSchema = calendarEventInsertSchema.partial();

export const calendarEventQuerySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(['meeting', 'event', 'all']).optional(),
});

export const meetingScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  agentId: z.string().min(1, 'Agent is required'),
  scheduledStartTime: z.date(),
  estimatedDuration: z.number().min(15).max(480), // 15 minutes to 8 hours
  type: z.enum(['scheduled', 'random']).default('scheduled'),
});

export type CalendarEventInsert = z.infer<typeof calendarEventInsertSchema>;
export type CalendarEventUpdate = z.infer<typeof calendarEventUpdateSchema>;
export type CalendarEventQuery = z.infer<typeof calendarEventQuerySchema>;
export type MeetingSchedule = z.infer<typeof meetingScheduleSchema>;