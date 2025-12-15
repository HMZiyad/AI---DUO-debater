
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Define the structure for the debate flow
type TurnConfig = {
  agent: 'Debate Agent 1' | 'Debate Agent 2';
  role: 'AFFIRMATIVE' | 'NEGATIVE';
  type: 'intro' | 'argument' | 'rebuttal_argument' | 'rebuttal_closing' | 'closing';
  instructions: string;
};

// 10-step turn definition
const TURN_MAP: Record<number, TurnConfig> = {
  0: { agent: 'Debate Agent 1', role: 'AFFIRMATIVE', type: 'intro', instructions: 'Generate ONLY your Thesis Statement. Keep it powerful and concise.' },
  1: { agent: 'Debate Agent 2', role: 'NEGATIVE', type: 'intro', instructions: 'Generate ONLY your Thesis Statement. Keep it powerful and concise.' },
  2: { agent: 'Debate Agent 1', role: 'AFFIRMATIVE', type: 'argument', instructions: 'Present your FIRST core argument (Point 1). Focus on theoretical potential.' },
  3: { agent: 'Debate Agent 2', role: 'NEGATIVE', type: 'rebuttal_argument', instructions: 'First, distinctively REFUTE the Affirmative\'s Point 1. Then, present your own FIRST core argument (Point 1) focusing on limitations.' },
  4: { agent: 'Debate Agent 1', role: 'AFFIRMATIVE', type: 'rebuttal_argument', instructions: 'First, distinctively REFUTE the Negative\'s Point 1. Then, present your SECOND core argument (Point 2).' },
  5: { agent: 'Debate Agent 2', role: 'NEGATIVE', type: 'rebuttal_argument', instructions: 'First, distinctively REFUTE the Affirmative\'s Point 2. Then, present your SECOND core argument (Point 2).' },
  6: { agent: 'Debate Agent 1', role: 'AFFIRMATIVE', type: 'rebuttal_argument', instructions: 'First, distinctively REFUTE the Negative\'s Point 2. Then, present your THIRD core argument (Point 3).' },
  7: { agent: 'Debate Agent 2', role: 'NEGATIVE', type: 'rebuttal_argument', instructions: 'First, distinctively REFUTE the Affirmative\'s Point 3. Then, present your THIRD core argument (Point 3).' },
  8: { agent: 'Debate Agent 1', role: 'AFFIRMATIVE', type: 'rebuttal_closing', instructions: 'First, distinctively REFUTE the Negative\'s Point 3. Then, provide your Closing Statement and Call to Action.' },
  9: { agent: 'Debate Agent 2', role: 'NEGATIVE', type: 'closing', instructions: 'Provide your Closing Statement and Call to Action.' },
};

export async function POST(request: Request) {
  let currentTurnIndex: number | undefined;

  try {
    const body = await request.json();
    const { resolution, history, turnIndex } = body;
    currentTurnIndex = turnIndex;

    if (!resolution || turnIndex === undefined) {
      return NextResponse.json({ error: 'Resolution and turnIndex are required' }, { status: 400 });
    }

    const config = TURN_MAP[turnIndex];
    if (!config) {
      return NextResponse.json({ error: 'Invalid turn index' }, { status: 400 });
    }

    // Construct the context from history
    const conversationContext = history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n\n');

    const prompt = `
SYSTEM: You are participating in a structured debate.
Resolution: "${resolution}"

Current State of Debate:
${conversationContext}

YOUR MISSION:
Identity: ${config.agent} (${config.role})
Task: ${config.instructions}

FORMATTING RULES:
- **LANGUAGE CONSTRAINT**: All output must be in **BENGALI** (Bangla).
- Write in a clear, persuasive, "chat-like" but professional voice.
- Do NOT output markdown headers like "I. THESIS" or "Point 1". Just output the raw content of your speech so it fits naturally in a chat bubble.
- If refuting, make it clear you are addressing the opponent's last point before moving to your own.
- Keep it under 150 words to keep the chat dynamic.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({
      role: config.role,
      agent: config.agent,
      content: responseText.trim(),
    });

  } catch (error: any) {
    console.error('Error generating turn:', error);

    // Check if we can fallback to a mock, but only if we know the turn index
    if (currentTurnIndex !== undefined && (error?.status === 429 || error?.toString().includes('429'))) {
      const fallbackConfig = TURN_MAP[currentTurnIndex];
      return NextResponse.json({
        role: fallbackConfig?.role || 'SYSTEM',
        agent: 'MOCK AGENT',
        content: "(API Quota Exceeded) This is a simulated Bengali response to keep the flow going.",
        isMock: true
      });
    }

    return NextResponse.json({
      error: 'Failed to generate debate turn',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
