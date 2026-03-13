import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import { syncCustomerToSanity } from '@/lib/services/syncService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ success: false, error: 'Google ID token is required' }, { status: 400 });
        }

        const apiKey = process.env.FIREBASE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIREBASE_API_KEY in backend configuration. Cannot verify credentials.");
        }

        // 1. Exchange the Google ID token for a Firebase session payload using Identity Toolkit REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postBody: `id_token=${idToken}&providerId=google.com`,
                requestUri: "http://localhost",
                returnIdpCredential: true,
                returnSecureToken: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: data.error?.message || 'Invalid Google ID token' }, { status: 401 });
        }

        // The user is authenticated in Firebase now, and we have their details in `data`
        const uid = data.localId;
        const email = data.email;
        const name = data.displayName || data.fullName || '';

        // 2. Check if a profile document exists for this user in Firestore
        const userDocRef = db.collection('customers').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // Provision Custom User Profile Document inside Firestore
            const newCustomerData = {
                firebaseUid: uid,
                name: name,
                email: email,
                phone: '',
                addresses: [],
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await userDocRef.set(newCustomerData);
            
            // Sync new user to Sanity
            await syncCustomerToSanity(uid, newCustomerData);
        } else {
            // Even if user exists, sync latest info back to Sanity
            await syncCustomerToSanity(uid, userDoc.data());
        }

        // Return session structured payload (identical format to regular login)
        return NextResponse.json({
            success: true,
            data: {
                token: data.idToken,           // Session token for headers
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                uid: data.localId,
                email: email,
                name: name
            }
        });
    } catch (error: unknown) {
        console.error('Error in /api/auth/google:', error);
        const errorMessage = error instanceof Error ? error.message : 'Google Auth failed';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
