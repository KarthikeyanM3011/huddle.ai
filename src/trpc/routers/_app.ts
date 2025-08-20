@@ .. @@
 import { createTRPCRouter } from '../init';
 import { agentsRouter } from '@/modules/agents/server/procedures';
 import { meetingsRouter } from '@/modules/meetings/server/procedures';
+import { calendarRouter } from '@/modules/calendar/server/procedures';

 export const appRouter = createTRPCRouter({
   agents: agentsRouter,
   meetings: meetingsRouter,
+  calendar: calendarRouter,
 });

 export type AppRouter = typeof appRouter;