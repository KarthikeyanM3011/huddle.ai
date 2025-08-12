import { z } from 'zod';

export const agentsInsertSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  instructions: z.string().min(1, 'Instructions are required').max(2000, 'Instructions must be less than 2000 characters'),
});

export const agentsUpdateSchema = agentsInsertSchema.partial();

export const agentsQuerySchema = z.object({
  page: z.number().min(1).max(100).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type AgentsInsert = z.infer<typeof agentsInsertSchema>;
export type AgentsUpdate = z.infer<typeof agentsUpdateSchema>;
export type AgentsQuery = z.infer<typeof agentsQuerySchema>;