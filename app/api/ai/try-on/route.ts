import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as admin from 'firebase-admin';

// Extract uid from Bearer token
async function getFirebaseUid(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (e) {
        return null;
    }
}

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export async function POST(req: NextRequest) {
    try {
        const firebaseUid = await getFirebaseUid(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!ai) {
            return NextResponse.json({ success: false, error: 'Gemini AI is not configured on the server.' }, { status: 503 });
        }

        const { product_id, image_url } = await req.json();

        if (!product_id || !image_url) {
            return NextResponse.json({ success: false, error: 'product_id and image_url are required' }, { status: 400 });
        }

        // Return a mock success response acknowledging the AI configuration works
        return NextResponse.json({
            success: true,
            message: "Try-on capability mocked successfully for roadmap.",
            simulated_image_url: 'https://via.placeholder.com/600x800.png?text=AI+Try-On+Result'
        });
    } catch (error) {
        console.error('Error generating AI try-on:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
