import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        // 1. Create completely anonymous account securely using the elevated Admin SDK privileges
        const userRecord = await admin.auth().createUser({});
        const guestUid = userRecord.uid;

        // 2. Generate a custom session token for the frontend to digest
        const customToken = await admin.auth().createCustomToken(guestUid);
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
                token: customToken,           // Session token for headers
                uid: guestUid,
                isGuest: true
            }
        });
    } catch (error: any) {
        console.error('Error in /api/auth/guest:', error);
        return NextResponse.json({ success: false, error: error.message || 'Guest login failed' }, { status: 500 });
    }
}
