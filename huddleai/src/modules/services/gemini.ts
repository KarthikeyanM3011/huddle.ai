import { GoogleGenAI } from "@google/genai";

const generateMeetingSummary = async (transcript: string): Promise<string> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `
    You are an AI assistant that creates natural, conversational meeting summaries for database storage and UI display.

    Transcript:
    """
    ${transcript}
    """

    Create a natural, conversational summary that tells the story of what happened in this meeting. Write it as if you're explaining to someone what took place during the session.

    Requirements:
    - Write in a natural, storytelling manner that flows well
    - Use conversational language that's easy to read and understand
    - Focus on what actually happened during the meeting
    - Keep it concise but engaging
    - Make it feel like a human is describing the meeting to another person
    - Don't use formal business language or bullet points
    - Start directly with the summary content

    Summary:`;
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    const summaryText = response.text;

    if (!summaryText || summaryText.trim().length === 0) {
      throw new Error('Failed to generate summary - empty response');
    }

    const cleanSummary = summaryText
      .replace(/^(Summary:|Meeting Summary:)/i, '')
      .trim();

    return cleanSummary;
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    
    return `Meeting summary could not be automatically generated due to a processing error. Please review the transcript manually for key discussion points and action items.`;
  }
};

export { generateMeetingSummary };