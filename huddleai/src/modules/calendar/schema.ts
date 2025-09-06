import { z } from 'zod';

export const calendarViewSchema = z.object({
  date: z.date().default(new Date()),
  view: z.enum(['month', 'week', 'day']).default('month'),
  showCompleted: z.boolean().default(false),
});

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  type: z.enum(['meeting', 'event']),
  status: z.enum(['upcoming', 'completed', 'cancelled']),
  meetingId: z.string().optional(),
  agentName: z.string().nullable().optional(),
});

export type CalendarView = z.infer<typeof calendarViewSchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;