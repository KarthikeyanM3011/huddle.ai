import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, and, ilike, count } from "drizzle-orm";
import { z } from "zod";
import { agentsInsertSchema, agentsUpdateSchema, agentsQuerySchema } from "../schema";

export const agentsRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(agentsQuerySchema)
        .query(async ({ input, ctx }) => {
            const { page, pageSize, search } = input;
            const offset = (page - 1) * pageSize;

            const whereConditions = [eq(agents.userId, ctx.auth.user.id)];
            
            if (search) {
                whereConditions.push(ilike(agents.name, `%${search}%`));
            }

            const [agentsList, totalCount] = await Promise.all([
                db
                    .select()
                    .from(agents)
                    .where(and(...whereConditions))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(agents.createdAt),
                db
                    .select({ count: count() })
                    .from(agents)
                    .where(and(...whereConditions))
                    .then(result => result[0]?.count ?? 0)
            ]);

            const agentsWithMeetings = agentsList.map(agent => ({
                ...agent,
                meetingsCount: 5,
            }));

            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                agents: agentsWithMeetings,
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
            const agent = await db
                .select()
                .from(agents)
                .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
                .limit(1);

            if (!agent.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Agent not found',
                });
            }

            return {
                ...agent[0],
                meetingsCount: 5,
            };
        }),

    create: protectedProcedure
        .input(agentsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdAgent] = await db
                .insert(agents)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();

            return createdAgent;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: agentsUpdateSchema,
        }))
        .mutation(async ({ input, ctx }) => {
            const existingAgent = await db
                .select()
                .from(agents)
                .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
                .limit(1);

            if (!existingAgent.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Agent not found',
                });
            }

            const [updatedAgent] = await db
                .update(agents)
                .set({
                    ...input.data,
                    updatedAt: new Date(),
                })
                .where(eq(agents.id, input.id))
                .returning();

            return updatedAgent;
        }),

    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const existingAgent = await db
                .select()
                .from(agents)
                .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
                .limit(1);

            if (!existingAgent.length) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Agent not found',
                });
            }

            await db
                .delete(agents)
                .where(eq(agents.id, input.id));

            return { success: true };
        }),
});