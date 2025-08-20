import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { calendarEvents, meetings, agents } from "@/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { z } from "zod";
import { calendarEventInsertSchema, calendarEventUpdateSchema, calendarEventQuerySchema, meetingScheduleSchema } from "../schema";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";

export const calendarRouter = createTRPCRouter({
  getEvents: protectedProcedure
    .input(calendarEventQuerySchema)
    .query(async ({ input, ctx }) => {
      const { startDate, endDate, type } = input;

      const whereConditions = [
        eq(calendarEvents.userId, ctx.auth.user.id),
        gte(calendarEvents.startTime, startDate),
        lte(calendarEvents.endTime, endDate),
      ];

      if (type && type !== 'all') {
        whereConditions.push(eq(calendarEvents.type, type));
      }

      const events = await db
        .select({
          id: calendarEvents.id,
          title: calendarEvents.title,
          description: calendarEvents.description,
          startTime: calendarEvents.startTime,
          endTime: calendarEvents.endTime,
          meetingId: calendarEvents.meetingId,
          type: calendarEvents.type,
          status: calendarEvents.status,
          reminderSent: calendarEvents.reminderSent,
          createdAt: calendarEvents.createdAt,
          updatedAt: calendarEvents.updatedAt,
          meetingStatus: meetings.status,
          agentName: agents.name,
        })
        .from(calendarEvents)
        .leftJoin(meetings, eq(calendarEvents.meetingId, meetings.id))
        .leftJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(...whereConditions))
        .orderBy(calendarEvents.startTime);

      return events.map(event => ({
        ...event,
        start: event.startTime,
        end: event.endTime,
        resource: {
          meetingId: event.meetingId,
          type: event.type,
          status: event.status,
          meetingStatus: event.meetingStatus,
          agentName: event.agentName,
        },
      }));
    }),

  createEvent: protectedProcedure
    .input(calendarEventInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdEvent] = await db
        .insert(calendarEvents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdEvent;
    }),

  scheduleeMeeting: protectedProcedure
    .input(meetingScheduleSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify agent exists and belongs to user
      const agent = await db
        .select()
        .from(agents)
        .where(and(eq(agents.id, input.agentId), eq(agents.userId, ctx.auth.user.id)))
        .limit(1);

      if (!agent.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found',
        });
      }

      const agentInstructions = agent[0].instructions;
      const endTime = new Date(input.scheduledStartTime.getTime() + (input.estimatedDuration * 60 * 1000));

      // Create meeting
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          name: input.name,
          agentId: input.agentId,
          instructions: agentInstructions,
          userId: ctx.auth.user.id,
          scheduledStartTime: input.scheduledStartTime,
          estimatedDuration: input.estimatedDuration.toString(),
          status: 'upcoming',
        })
        .returning();

      // Create calendar event
      const [createdEvent] = await db
        .insert(calendarEvents)
        .values({
          title: input.name,
          description: `Meeting with ${agent[0].name}`,
          startTime: input.scheduledStartTime,
          endTime: endTime,
          meetingId: createdMeeting.id,
          type: 'meeting',
          status: 'scheduled',
          userId: ctx.auth.user.id,
        })
        .returning();

      // Create Stream call
      try {
        const call = streamVideo.video.call('default', createdMeeting.id);
        
        await call.create({
          data: {
            created_by_id: ctx.auth.user.id,
            custom: {
              meetingId: createdMeeting.id,
              meetingName: createdMeeting.name,
              instructions: agentInstructions,
            },
            settings_override: {
              transcription: {
                language: 'en',
                mode: 'auto-on',
                closed_caption_mode: 'auto-on',
              },
              recording: {
                quality: '1080p',
                mode: 'auto-on',
              },
            },
          },
        });

        const agentData = agent[0];
        const agentImage = generateAvatarUri({ 
          seed: agentData.name, 
          variant: 'botttsNeutral' 
        });

        await streamVideo.upsertUsers([{
          id: agentData.id,
          name: agentData.name,
          role: 'user',
          image: agentImage,
        }]);

      } catch (error) {
        console.error('Failed to create stream call:', error);
      }

      return {
        meeting: createdMeeting,
        event: createdEvent,
      };
    }),

  updateEvent: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: calendarEventUpdateSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const existingEvent = await db
        .select()
        .from(calendarEvents)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.auth.user.id)))
        .limit(1);

      if (!existingEvent.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      const [updatedEvent] = await db
        .update(calendarEvents)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(calendarEvents.id, input.id))
        .returning();

      return updatedEvent;
    }),

  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existingEvent = await db
        .select()
        .from(calendarEvents)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.userId, ctx.auth.user.id)))
        .limit(1);

      if (!existingEvent.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      await db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, input.id));

      return { success: true };
    }),

  getUpcomingReminders: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      const upcomingEvents = await db
        .select({
          id: calendarEvents.id,
          title: calendarEvents.title,
          startTime: calendarEvents.startTime,
          meetingId: calendarEvents.meetingId,
          reminderSent: calendarEvents.reminderSent,
        })
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.userId, ctx.auth.user.id),
            eq(calendarEvents.type, 'meeting'),
            eq(calendarEvents.status, 'scheduled'),
            eq(calendarEvents.reminderSent, false),
            gte(calendarEvents.startTime, now),
            lte(calendarEvents.startTime, tenMinutesFromNow)
          )
        );

      return upcomingEvents;
    }),

  markReminderSent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(calendarEvents)
        .set({
          reminderSent: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(calendarEvents.id, input.eventId),
            eq(calendarEvents.userId, ctx.auth.user.id)
          )
        );

      return { success: true };
    }),
});