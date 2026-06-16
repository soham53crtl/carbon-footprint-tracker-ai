import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/auth-service';
import { getChatbotResponse } from '@/lib/ai-service';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Sanitizes raw user input before it reaches the AI service.
 * Strips HTML tags and script-like content to prevent XSS payloads
 * from being stored, echoed, or forwarded to the Gemini API.
 *
 * @param input - Raw user-submitted message
 * @returns Sanitized plain-text string, capped at 1000 characters
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 1000);
}

export async function POST(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Rate limit: 10 requests per minute per authenticated user
  const rateCheck = checkRateLimit(session.userId);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sanitized = sanitizeInput(message);
    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const response = await getChatbotResponse(sanitized);
    return NextResponse.json({ success: true, reply: response });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
