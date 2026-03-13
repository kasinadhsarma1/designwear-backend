import { NextResponse } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';
import { syncCustomerToSanity } from '@/lib/services/syncService';

export async function POST() {
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

        // 3. Sync guest to Sanity Studio
        const guestData = {
            firebaseUid: guestUid,
            name: 'Guest User',
            email: '',
            isGuest: true,
            createdAt: new Date().toISOString()
        };
        await syncCustomerToSanity(guestUid, guestData);

        // 4. Return the token directly to the frontend
        return NextResponse.json({
            success: true,
            data: {
                token: customToken,           // Session token for headers
                uid: guestUid,
                isGuest: true,
                addresses: [],
                paymentMethods: []
            }
        });
    } catch (error: unknown) {
        console.error('Error in /api/auth/guest:', error);
        const errorMessage = error instanceof Error ? error.message : 'Guest login failed';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
