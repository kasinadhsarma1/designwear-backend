import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.FIREBASE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIREBASE_API_KEY in backend configuration. Cannot provision guest.");
        }

        // 1. Create completely anonymous account using REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                returnSecureToken: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: data.error?.message || 'Failed to generate guest session' }, { status: 500 });
        }

        // 2. Create basic customer document linking to guest UID (optional but good for orders)
        const guestUid = data.localId;
        await db.collection('customers').doc(guestUid).set({
            firebaseUid: guestUid,
            name: 'Guest User',
            email: '',
            isGuest: true,
            createdAt: new Date().toISOString()
        }, { merge: true });

        // 3. Return the token directly to the frontend
        return NextResponse.json({
            success: true,
            data: {
                token: data.idToken,           // Session token for headers
                refreshToken: data.refreshToken,
                uid: guestUid,
                isGuest: true
            }
        });
    } catch (error: any) {
        console.error('Error in /api/auth/guest:', error);
        return NextResponse.json({ success: false, error: error.message || 'Guest login failed' }, { status: 500 });
    }
}
