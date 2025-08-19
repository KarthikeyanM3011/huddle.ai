// import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
// import { TRPCError } from "@trpc/server";
// import { db } from "@/db";
// import { agents } from "@/db/schema";
// import { eq, and, ilike, count } from "drizzle-orm";
// import { z } from "zod";
// import { agentsInsertSchema, agentsUpdateSchema, agentsQuerySchema } from "../schema";


// // Gemini AI service for generating enhanced instructions
// const generateEnhancedInstructions = async (agentName: string, userInstructions: string): Promise<string> => {
//   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
//   if (!GEMINI_API_KEY) {
//     throw new Error('Gemini API key not configured');
//   }

//   const prompt = `
// You are an AI assistant that helps create detailed, professional instructions for AI agents. 

// Given the following:
// - Agent Name: "${agentName}"
// - User's Basic Instructions: "${userInstructions}"

// Create comprehensive, clear, and actionable instructions for this AI agent. The instructions should:

// 1. Define the agent's role and purpose clearly
// 2. Specify the agent's personality and communication style
// 3. Outline key responsibilities and capabilities
// 4. Include guidelines for interaction and behavior
// 5. Set boundaries and limitations where appropriate
// 6. Be professional yet engaging
// 7. Be specific enough to guide the agent's responses consistently

// Format the response as a well-structured instruction set that the AI agent can follow. Make it detailed but concise (aim for 300-800 words).

// Enhanced Instructions:`;

//   try {
//     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: [{
//           parts: [{
//             text: prompt
//           }]
//         }],
//         generationConfig: {
//           temperature: 0.7,
//           topK: 1,
//           topP: 1,
//           maxOutputTokens: 1024,
//         }
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Gemini API error: ${response.status}`);
//     }

//     const data = await response.json();
//     const enhancedInstructions = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
//     if (!enhancedInstructions) {
//       throw new Error('Failed to generate enhanced instructions');
//     }

//     return enhancedInstructions.trim();
//   } catch (error) {
//     console.error('Error generating enhanced instructions:', error);
//     // Fallback to user instructions if Gemini fails
//     return `Agent Name: ${agentName}\n\nRole: AI Assistant\n\nInstructions: ${userInstructions}\n\nPlease follow these instructions carefully and maintain a professional, helpful demeanor in all interactions.`;
//   }
// };


// export const agentsRouter = createTRPCRouter({
//     getMany: protectedProcedure
//         .input(agentsQuerySchema)
//         .query(async ({ input, ctx }) => {
//             const { page, pageSize, search } = input;
//             const offset = (page - 1) * pageSize;

//             const whereConditions = [eq(agents.userId, ctx.auth.user.id)];
            
//             if (search) {
//                 whereConditions.push(ilike(agents.name, `%${search}%`));
//             }

//             const [agentsList, totalCount] = await Promise.all([
//                 db
//                     .select()
//                     .from(agents)
//                     .where(and(...whereConditions))
//                     .limit(pageSize)
//                     .offset(offset)
//                     .orderBy(agents.createdAt),
//                 db
//                     .select({ count: count() })
//                     .from(agents)
//                     .where(and(...whereConditions))
//                     .then(result => result[0]?.count ?? 0)
//             ]);

//             const agentsWithMeetings = agentsList.map(agent => ({
//                 ...agent,
//                 meetingsCount: 5,
//             }));

//             const totalPages = Math.ceil(totalCount / pageSize);

//             return {
//                 agents: agentsWithMeetings,
//                 pagination: {
//                     page,
//                     pageSize,
//                     total: totalCount,
//                     totalPages,
//                 },
//             };
//         }),

//     getOne: protectedProcedure
//         .input(z.object({ id: z.string() }))
//         .query(async ({ input, ctx }) => {
//             const agent = await db
//                 .select()
//                 .from(agents)
//                 .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
//                 .limit(1);

//             if (!agent.length) {
//                 throw new TRPCError({
//                     code: 'NOT_FOUND',
//                     message: 'Agent not found',
//                 });
//             }

//             return {
//                 ...agent[0],
//                 meetingsCount: 5,
//             };
//         }),

//     create: protectedProcedure
//         .input(agentsInsertSchema)
//         .mutation(async ({ input, ctx }) => {
//             try {
//                 // Generate enhanced instructions using Gemini
//                 const enhancedInstructions = await generateEnhancedInstructions(
//                     input.name, 
//                     input.instructions
//                 );

//                 const [createdAgent] = await db
//                     .insert(agents)
//                     .values({
//                         name: input.name,
//                         instructions: enhancedInstructions, // Store the AI-enhanced instructions
//                         originalInstructions: input.instructions, // Keep original user input
//                         userId: ctx.auth.user.id,
//                     })
//                     .returning();

//                 return {
//                     ...createdAgent,
//                     originalInstructions: input.instructions, // Return both for frontend
//                 };
//             } catch (error) {
//                 console.error('Error creating agent with enhanced instructions:', error);
//                 throw new TRPCError({
//                     code: 'INTERNAL_SERVER_ERROR',
//                     message: 'Failed to create agent with enhanced instructions',
//                 });
//             }
//         }),

//     // New procedure to preview enhanced instructions before creating
//     previewEnhancedInstructions: protectedProcedure
//         .input(z.object({
//             name: z.string().min(1),
//             instructions: z.string().min(1),
//         }))
//         .mutation(async ({ input }) => {
//             try {
//                 const enhancedInstructions = await generateEnhancedInstructions(
//                     input.name,
//                     input.instructions
//                 );

//                 return {
//                     original: input.instructions,
//                     enhanced: enhancedInstructions,
//                 };
//             } catch (error) {
//                 console.error('Error generating preview:', error);
//                 throw new TRPCError({
//                     code: 'INTERNAL_SERVER_ERROR',
//                     message: 'Failed to generate enhanced instructions preview',
//                 });
//             }
//         }),

//     update: protectedProcedure
//         .input(z.object({
//             id: z.string(),
//             data: agentsUpdateSchema,
//         }))
//         .mutation(async ({ input, ctx }) => {
//             const existingAgent = await db
//                 .select()
//                 .from(agents)
//                 .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
//                 .limit(1);

//             if (!existingAgent.length) {
//                 throw new TRPCError({
//                     code: 'NOT_FOUND',
//                     message: 'Agent not found',
//                 });
//             }

//             const [updatedAgent] = await db
//                 .update(agents)
//                 .set({
//                     ...input.data,
//                     updatedAt: new Date(),
//                 })
//                 .where(eq(agents.id, input.id))
//                 .returning();

//             return updatedAgent;
//         }),

//     remove: protectedProcedure
//         .input(z.object({ id: z.string() }))
//         .mutation(async ({ input, ctx }) => {
//             const existingAgent = await db
//                 .select()
//                 .from(agents)
//                 .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
//                 .limit(1);

//             if (!existingAgent.length) {
//                 throw new TRPCError({
//                     code: 'NOT_FOUND',
//                     message: 'Agent not found',
//                 });
//             }

//             await db
//                 .delete(agents)
//                 .where(eq(agents.id, input.id));

//             return { success: true };
//         }),
// });

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, and, ilike, count } from "drizzle-orm";
import { z } from "zod";
import { agentsInsertSchema, agentsUpdateSchema, agentsQuerySchema } from "../schema";
import { GoogleGenAI } from "@google/genai";
// Gemini AI service for generating enhanced instructions
const generateEnhancedInstructions = async (agentName: string, userInstructions: string): Promise<string> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `
You are an AI assistant that helps create detailed, professional instructions for AI agents. 

Given the following:
- Agent Name: "${agentName}"
- User's Basic Instructions: "${userInstructions}"

Create comprehensive, clear, and actionable instructions for this AI agent. The instructions should:

1. Define the agent's role and purpose clearly
2. Specify the agent's personality and communication style
3. Outline key responsibilities and capabilities
4. Include guidelines for interaction and behavior
5. Set boundaries and limitations where appropriate
6. Be professional yet engaging
7. Be specific enough to guide the agent's responses consistently

Format the response as a well-structured instruction set that the AI agent can follow. Make it detailed but concise (aim for 300-800 words).

Enhanced Instructions:`;

  try {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
    console.log(response.text);
    const enhancedInstructions = response.text;
    
    if (!enhancedInstructions) {
      throw new Error('Failed to generate enhanced instructions');
    }

    return enhancedInstructions.trim();
  } catch (error) {
    console.error('Error generating enhanced instructions:', error);
    // Fallback to user instructions if Gemini fails
    return `Agent Name: ${agentName}\n\nRole: AI Assistant\n\nInstructions: ${userInstructions}\n\nPlease follow these instructions carefully and maintain a professional, helpful demeanor in all interactions.`;
  }
};

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
            try {
                // Generate enhanced instructions using Gemini
                const enhancedInstructions = await generateEnhancedInstructions(
                    input.name, 
                    input.instructions
                );

                const [createdAgent] = await db
                    .insert(agents)
                    .values({
                        name: input.name,
                        instructions: enhancedInstructions, // Store the AI-enhanced instructions
                        userId: ctx.auth.user.id,
                    })
                    .returning();

                return {
                    ...createdAgent,
                    originalInstructions: input.instructions, // Return both for frontend
                };
            } catch (error) {
                console.error('Error creating agent with enhanced instructions:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create agent with enhanced instructions',
                });
            }
        }),

    // New procedure to preview enhanced instructions before creating
    previewEnhancedInstructions: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            instructions: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
            try {
                const enhancedInstructions = await generateEnhancedInstructions(
                    input.name,
                    input.instructions
                );

                return {
                    original: input.instructions,
                    enhanced: enhancedInstructions,
                };
            } catch (error) {
                console.error('Error generating preview:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to generate enhanced instructions preview',
                });
            }
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: agentsUpdateSchema.extend({
                regenerateInstructions: z.boolean().optional(),
            }),
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

            let updateData = { ...input.data };

            // If instructions are being updated and regeneration is requested
            if (input.data.instructions && input.data.regenerateInstructions) {
                try {
                    const enhancedInstructions = await generateEnhancedInstructions(
                        input.data.name || existingAgent[0].name,
                        input.data.instructions
                    );
                    
                    updateData = {
                        ...updateData,
                        instructions: enhancedInstructions,
                        originalInstructions: input.data.instructions,
                    };
                } catch (error) {
                    console.error('Error regenerating instructions:', error);
                    // Continue with regular update if enhancement fails
                }
            }

            const [updatedAgent] = await db
                .update(agents)
                .set({
                    ...updateData,
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