import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Available free tier models in order of preference
const MODELS = [
  { name: 'gemini-2.5-flash', description: 'Fast & efficient (recommended)' },
  { name: 'gemini-2.0-flash', description: 'Good for basic tasks' },
  { name: 'gemini-2.5-pro', description: 'High quality (may be rate limited)' }
];

// Rate limiting for free tier (requests per minute)
let requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 5; // Free tier limit

function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  // Remove timestamps older than 1 minute
  requestTimestamps = requestTimestamps.filter(t => now - t < 60000);
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = requestTimestamps[0];
    const waitTime = Math.ceil((oldest + 60000 - now) / 1000);
    return { allowed: false, waitTime };
  }
  
  requestTimestamps.push(now);
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      return NextResponse.json(
        { reply: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { message, courseContext, courseTitle } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        reply: `📊 Free tier limit: ${MAX_REQUESTS_PER_MINUTE} requests per minute. Please wait ${rateLimit.waitTime} seconds before sending another message.`,
        rateLimited: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;

    // Try each model until one works
    for (const modelConfig of MODELS) {
      try {
        console.log(`Trying model: ${modelConfig.name}...`);
        
        const model = genAI.getGenerativeModel({ model: modelConfig.name });
        
        const prompt = `You are an AI tutor for "${courseTitle || 'LMS Platform'}". 
Your role is to help students learn and understand course material.

Guidelines:
- Be helpful, patient, and encouraging
- Provide clear, educational explanations
- Keep responses concise (2-4 sentences)
- Use emojis occasionally 😊

${courseContext ? `\nCourse Context: ${courseContext}\n` : ''}

Student question: ${message}

Provide a helpful response:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ Model ${modelConfig.name} worked!`);
        
        return NextResponse.json({ 
          reply: text,
          success: true,
          modelUsed: modelConfig.name
        });
        
      } catch (error: any) {
        console.warn(`❌ Model ${modelConfig.name} failed:`, error.message);
        lastError = error;
        
        // If quota exceeded, try next model
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          continue;
        }
        
        // If model not found, try next model
        if (error.message?.includes('404')) {
          continue;
        }
      }
    }
    
    // If all models failed
    console.error('All models failed:', lastError);
    
    // Check if it's a quota issue
    if (lastError?.message?.includes('429')) {
      return NextResponse.json({ 
        reply: "📊 The AI service is currently busy. Free tier has limited requests. Please wait about 60 seconds and try again. Thank you for your patience! 🙏",
        rateLimited: true
      });
    }
    
    return NextResponse.json(
      { reply: "I'm having trouble responding right now. Please try again in a moment." },
      { status: 500 }
    );
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble responding right now. Please try again later." },
      { status: 500 }
    );
  }
}