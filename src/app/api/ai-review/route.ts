import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stats, habits, chatHistory, prompt: userMessage, apiKey } = body;

    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalApiKey) {
      return NextResponse.json({ error: "API Key is required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(finalApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let fullPrompt = `Context: You are an expert habit coach.
    
    Current 7-day Stats:
    - Total Habits Tracked: ${stats.totalHabits}
    - Weekly Completion Rate: ${stats.completionRate}%
    - Best Streak: ${stats.bestStreak} days
    - Most Missed Habit: ${stats.mostMissed}
    
    IMPORTANT INSTRUCTION: You MUST provide all responses in conversational plain text. Do NOT use markdown formatting, do NOT use asterisks, do NOT use bolding, and do NOT use bullet points. Keep it highly readable, conversational, and friendly as if you are texting the user.
    
    `;

    if (chatHistory && chatHistory.length > 0) {
      fullPrompt += `\nConversation History:\n`;
      chatHistory.forEach((msg: any) => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Coach'}: ${msg.content}\n`;
      });
      fullPrompt += `\nUser's latest message: ${userMessage}\nCoach:`;
    } else {
      fullPrompt += `The user has just clicked "Analyze My Week". Provide a short, friendly 3-sentence review of their adherence and one plain-text tip.`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ review: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI review." }, { status: 500 });
  }
}
