import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, courseContext, courseTitle } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI tutor for "${courseTitle || 'LMS Platform'}". 
Your role is to help students learn and understand course material.

Guidelines:
- Be helpful, patient, and encouraging
- Provide clear, educational explanations
- Use examples when helpful
- If you don't know something, say so honestly
- Keep responses concise but informative (2-4 sentences)
- Use emojis occasionally to be friendly 😊

${courseContext ? `\nCourse Context: ${courseContext}\n` : ''}

Student question: ${message}

Provide a helpful response as a tutor:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      reply: text,
      success: true 
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response', reply: 'Sorry, I\'m having trouble responding right now. Please try again.' },
      { status: 500 }
    );
  }
}