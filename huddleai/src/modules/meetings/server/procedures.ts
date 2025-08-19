import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { eq, and, ilike, count } from "drizzle-orm";
import { z } from "zod";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";
import { meetingsInsertSchema, meetingsUpdateSchema, meetingsQuerySchema } from "../schema";

export const meetingsRouter = createTRPCRouter({
    generateToken: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const user = ctx.auth.user;
            const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
            const issuedAt = Math.floor(Date.now() / 1000) - 60;

            const userImage = user.image || generateAvatarUri({ 
                seed: user.name || user.email, 
                variant: 'initials' 
            });

            await streamVideo.upsertUsers([{
                id: user.id,
                name: user.name || user.email,
                role: 'admin',
                image: userImage,
            }]);

            const token = streamVideo.generateUserToken({
                user_id: user.id,
                validity_in_seconds: 3600,
                iat: issuedAt,
                exp: expirationTime,
            });

            return { token };
        }),

    getMany: protectedProcedure
        .input(meetingsQuerySchema)
        .query(async ({ input, ctx }) => {
            const { page, pageSize, search, status, agentId } = input;
            const offset = (page - 1) * pageSize;

            const whereConditions = [eq(meetings.userId, ctx.auth.user.id)];
            
            if (search) {
                whereConditions.push(ilike(meetings.name, `%${search}%`));
            }

            if (status) {
                whereConditions.push(eq(meetings.status, status as any));
            }

            if (agentId) {
                whereConditions.push(eq(meetings.agentId, agentId));
            }

            const [meetingsList, totalCount] = await Promise.all([
                db
                    .select({
                        id: meetings.id,
                        name: meetings.name,
                        status: meetings.status,
                        instructions: meetings.instructions,
                        startedAt: meetings.startedAt,
                        endedAt: meetings.endedAt,
                        transcriptUrl: meetings.transcriptUrl,
                        recordingUrl: meetings.recordingUrl,
                        summary: meetings.summary,
                        createdAt: meetings.createdAt,
                        updatedAt: meetings.updatedAt,
                        agentId: meetings.agentId,
                        agentName: agents.name,
                    })
                    .from(meetings)
                    .leftJoin(agents, eq(meetings.agentId, agents.id))
                    .where(and(...whereConditions))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(meetings.createdAt),
                db
                    .select({ count: count() })
                    .from(meetings)
                    .where(and(...whereConditions))
                    .then(result => result[0]?.count ?? 0)
            ]);

            const meetingsWithDuration = meetingsList.map(meeting => {
                let duration = null;
                if (meeting.startedAt && meeting.endedAt) {
                    duration = new Date(meeting.endedAt).getTime() - new Date(meeting.startedAt).getTime();
                }
                return {
                    ...meeting,
                    duration,
                };
            });

            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                meetings: meetingsWithDuration,
                pagination: {
                    page,
                    pageSize,
                    total: totalCount,
                    totalPages,
                },
            };
        }),

    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const meeting = await db
                .select({
                    id: meetings.id,
                    name: meetings.name,
                    status: meetings.status,
                    instructions: meetings.instructions,
                    startedAt: meetings.startedAt,
                    endedAt: meetings.endedAt,
                    transcriptUrl: meetings.transcriptUrl,
                    recordingUrl: meetings.recordingUrl,
                    summary: meetings.summary,
                    createdAt: meetings.createdAt,
                    updatedAt: meetings.updatedAt,
                    agentId: meetings.agentId,
                    agentName: agents.name,
                })
                .from(meetings)
                .leftJoin(agents, eq(meetings.agentId, agents.id))
                .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)))
                .limit(1);

            if (!meeting.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting not found',
                });
            }

            const meetingData = meeting[0];
            let duration = null;
            if (meetingData.startedAt && meetingData.endedAt) {
                duration = new Date(meetingData.endedAt).getTime() - new Date(meetingData.startedAt).getTime();
            }

            return {
                ...meetingData,
                duration,
            };
        }),

    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
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

            const [createdMeeting] = await db
                .insert(meetings)
                .values({
                    ...input,
                    instructions: agentInstructions, 
                    userId: ctx.auth.user.id,
                })
                .returning();

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

            return createdMeeting;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: meetingsUpdateSchema,
        }))
        .mutation(async ({ input, ctx }) => {
            const existingMeeting = await db
                .select()
                .from(meetings)
                .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)))
                .limit(1);

            if (!existingMeeting.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting not found',
                });
            }

            if (input.data.agentId) {
                const agent = await db
                    .select()
                    .from(agents)
                    .where(and(eq(agents.id, input.data.agentId), eq(agents.userId, ctx.auth.user.id)))
                    .limit(1);

                if (!agent.length) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Agent not found',
                    });
                }
            }

            const [updatedMeeting] = await db
                .update(meetings)
                .set({
                    ...input.data,
                    updatedAt: new Date(),
                })
                .where(eq(meetings.id, input.id))
                .returning();

            return updatedMeeting;
        }),

    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const existingMeeting = await db
                .select()
                .from(meetings)
                .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)))
                .limit(1);

            if (!existingMeeting.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting not found',
                });
            }

            await db
                .delete(meetings)
                .where(eq(meetings.id, input.id));

            return { success: true };
        }),
});