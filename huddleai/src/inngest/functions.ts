// import JSONL from "jsonl-parse-stringify";
// import { inngest } from "@/inngest/client";
// import { db } from "@/db";
// import { inArray, eq } from "drizzle-orm";
// import { agents, meetings, user } from "@/db/schema";
// import { createAgent, gemini, TextMessage } from "@inngest/agent-kit";

// const summarizer = createAgent({
//   name: "summarizer",
//   system: "You are a helpful assistant that summarizes meeting transcripts.",
//   model: gemini({
//     model: "gemini-1.5-flash",
//     apiKey: process.env.GEMINI_API_KEY!,
//   }),
// });

// export const meetingsProcessing = inngest.createFunction(
//   { id: "meetings/processing" },
//   { event: "meetings/processing" },
//   async ({ event, step }) => {
//     const response = await step.fetch(event.data.transcriptUrl);

//     const transcript = await step.run("parse-transcript", async () => {
//       const text = await response.text();
//       return JSONL.parse<StreamTranscriptItem>(text);
//     });

//     const transcriptWithSpeakers = await step.run("add-speakers", async () => {
//       const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

//       const userSpeakers = await db
//         .select()
//         .from(user)
//         .where(inArray(user.id, speakerIds));

//       const agentSpeakers = await db
//         .select()
//         .from(agents)
//         .where(inArray(agents.id, speakerIds));

//       const speakers = [...userSpeakers, ...agentSpeakers];

//       return transcript.map((item) => {
//         const speaker = speakers.find((s) => s.id === item.speaker_id);
//         return {
//           ...item,
//           user: {
//             name: speaker?.name ?? "Unknown",
//           },
//         };
//       });
//     });

//     const { output } = await summarizer.run({
//       messages: [
//         {
//           role: "user",
//           content:
//             "Summarize the following transcript:\n" +
//             JSONL.stringify(transcriptWithSpeakers),
//         },
//       ],
//     });

//     await step.run("save-summary", async () => {
//       await db
//         .update(meetings)
//         .set({
//           summary: (output[0] as TextMessage).content as string,
//           status: "completed",
//         })
//         .where(eq(meetings.id, event.data.meetingId));
//     });
//   }
// );

import JSONL from "jsonl-parse-stringify";
import { inngest } from "@/inngest/client";
import { db } from "@/db";
import { inArray, eq } from "drizzle-orm";
import { agents, meetings, user } from "@/db/schema";
import { createAgent, gemini, TextMessage } from "@inngest/agent-kit";

export type StreamTranscriptItem = {
  speaker_id: string;
  type: string;
  text: string;
  start_ts: number;
  stop_ts: number;
};

const summarizer = createAgent({
  name: "summarizer",
  system: `You are an expert meeting transcript summarizer with deep expertise in organizational communication and content analysis. Your role is to transform raw meeting transcripts into comprehensive, actionable summaries that capture the essence of business discussions.

CORE RESPONSIBILITIES:
- Analyze meeting transcripts with precision and contextual understanding
- Identify key decisions, action items, and strategic outcomes
- Recognize participant contributions and maintain speaker attribution when relevant
- Extract critical business insights and next steps
- Maintain professional tone while preserving important nuances

SUMMARY STRUCTURE:
1. Executive Summary: 2-3 sentences capturing the meeting's primary purpose and outcomes
2. Key Decisions Made: Bullet points of concrete decisions reached
3. Action Items: Specific tasks assigned with responsible parties when identifiable
4. Important Discussion Points: Major topics covered and significant insights shared
5. Next Steps: Follow-up actions and future meeting requirements

ANALYSIS GUIDELINES:
- Prioritize actionable content over conversational filler
- Preserve important context that affects decision-making
- Note any unresolved issues or areas requiring further discussion
- Identify recurring themes or patterns in the conversation
- Maintain objectivity while highlighting critical business implications

OUTPUT REQUIREMENTS:
- Use clear, professional business language
- Organize information hierarchically by importance
- Include specific details for action items (deadlines, responsibilities, deliverables)
- Ensure summary length is proportional to transcript complexity
- Focus on outcomes and forward-looking elements rather than process details

QUALITY STANDARDS:
- Accuracy in representing discussed topics and decisions
- Completeness in capturing all significant meeting outcomes
- Clarity in distinguishing between proposals, decisions, and action items
- Relevance in filtering important information from casual conversation
- Professional presentation suitable for executive review and team coordination`,
  model: gemini({
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
  }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    console.log("Processing meeting:", event.data.meetingId);
    console.log("Transcript URL:", event.data.transcriptUrl);

    const response = await step.fetch(event.data.transcriptUrl);

    const transcript = await step.run("parse-transcript", async () => {
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      console.log("Response content type:", response.headers.get('content-type'));
      console.log("Response content length:", text.length);
      console.log("Response content preview:", text.substring(0, 200));
      
      if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
        console.error("Received XML/HTML content instead of JSONL");
        if (text.includes('AccessDenied')) {
          throw new Error(`Access denied to transcript URL. Check permissions and authentication for: ${event.data.transcriptUrl}`);
        }
        throw new Error(`Expected JSONL format but received XML/HTML content. Content preview: ${text.substring(0, 100)}...`);
      }
      
      try {
        const parsed = JSONL.parse(text) as StreamTranscriptItem[];
        console.log("Successfully parsed transcript with", parsed.length, "items");
        return parsed;
      } catch (error) {
        console.error("JSONL parsing error:", error);
        throw new Error(`Failed to parse JSONL content: ${error}. Content preview: ${text.substring(0, 100)}...`);
      }
    });

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds));

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds));

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find((s) => s.id === item.speaker_id);
        return {
          ...item,
          user: {
            name: speaker?.name ?? "Unknown",
          },
        };
      });
    });

    const { output } = await summarizer.run(
      "Summarize the following meeting transcript:\n" +
      JSONL.stringify(transcriptWithSpeakers)
    );

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });
  }
);