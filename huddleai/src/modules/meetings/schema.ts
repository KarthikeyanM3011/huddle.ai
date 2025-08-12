import { z } from 'zod';

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  agentId: z.string().min(1, 'Agent is required'),
  instructions: z.string().min(1, 'Instructions are required').max(2000, 'Instructions must be less than 2000 characters'),
});

export const meetingsUpdateSchema = meetingsInsertSchema.partial();

export const meetingsQuerySchema = z.object({
  page: z.number().min(1).max(100).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled', 'processing']).optional(),
  agentId: z.string().optional(),
});

export type MeetingsInsert = z.infer<typeof meetingsInsertSchema>;
export type MeetingsUpdate = z.infer<typeof meetingsUpdateSchema>;
export type MeetingsQuery = z.infer<typeof meetingsQuerySchema>;