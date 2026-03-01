import { NextResponse, NextRequest } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent';

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'Gemini API key is missing' }, { status: 503 });
        }

        const body = await req.json();
        const { systemPrompt, history, userMessage } = body;

        // Construct history exactly as frontend expected
        const fullHistory = history || [];
        fullHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const requestBody = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: fullHistory,
            generationConfig: { temperature: 0.7 }
        };

        const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: data.error?.message || 'Gemini Agent API Error' }, { status: response.status });
        }

        return NextResponse.json({ success: true, data: data });
    } catch (error: any) {
        console.error('Error in AI Agent endpoint:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
