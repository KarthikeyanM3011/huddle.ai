import { NextRequest, NextResponse } from 'next/server';
import { 
  CallEndedEvent, 
  CallTranscriptionReadyEvent, 
  CallSessionParticipantLeftEvent, 
  CallRecordingReadyEvent, 
  CallSessionStartedEvent 
} from '@stream-io/node-sdk';
import { and, eq, not } from 'drizzle-orm';
import { db } from '@/db';
import { meetings, agents } from '@/db/schema';
import { streamVideo } from '@/lib/stream-video';

function verifySignatureWithSdk(body: string, signature: string): boolean {
  try {
    return streamVideo.verifyWebhook(body, signature);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-signature');
  const apiKey = req.headers.get('x-api-key');

  if (!signature || !apiKey) {
    return NextResponse.json({ error: 'Missing signature or API key' }, { status: 400 });
  }

  const body = await req.text();
  
  if (!verifySignatureWithSdk(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === 'call.session_started') {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;
    
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meeting ID' }, { status: 400 });
    }

    const existingMeeting = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, 'completed')),
          not(eq(meetings.status, 'active')),
          not(eq(meetings.status, 'cancelled')),
          not(eq(meetings.status, 'processing'))
        )
      )
      .limit(1);

    if (!existingMeeting.length) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    await db
      .update(meetings)
      .set({ 
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId));

    const agentId = existingMeeting[0].agentId;
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID not found' }, { status: 400 });
    }

    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent.length) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const call = streamVideo.video.call('default', meetingId);
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: agentId
    });

    await realtimeClient.updateSession({
      instructions: agent[0].instructions
    });

  } else if (eventType === 'call.session_participant_left') {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(':')[1];
    
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meeting ID' }, { status: 400 });
    }

    const call = streamVideo.video.call('default', meetingId);
    await call.end();

    await db
      .update(meetings)
      .set({ 
        status: 'completed',
        endedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId));

  } else if (eventType === 'call.session_ended') {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;
    
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meeting ID' }, { status: 400 });
    }

    if (meetingId) {
      await db
        .update(meetings)
        .set({ 
          status: 'processing',
          endedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, 'active')));
    }

  } else if (eventType === 'call.transcription_ready') {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(':')[1];
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meeting ID' }, { status: 400 });
    }

    const updateMeeting = await db
      .update(meetings)
      .set({ 
        status: 'completed',
        transcriptUrl: event.call_transcription.url,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId));

    if (!updateMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    
  } else if (eventType === 'call.recording_ready') {

    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(':')[1];

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meeting ID' }, { status: 400 });
    }

    const updateMeeting = await db
      .update(meetings)
      .set({ 
        status: 'completed',
        recordingUrl: event.call_recording.url,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId));
    
    if (!updateMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

  }

  return NextResponse.json({ status: 'ok' });
}