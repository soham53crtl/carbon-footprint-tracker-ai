import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/auth-service';
import { getChatbotResponse } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await getChatbotResponse(message);
    return NextResponse.json({ success: true, reply: response });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
