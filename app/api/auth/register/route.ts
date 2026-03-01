import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        // 1. Create User in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name || '',
        });

        // 2. Provision Custom User Profile Document inside Firestore
        const newCustomerData = {
            firebaseUid: userRecord.uid,
            name: name || '',
            email: email,
            phone: '',
            addresses: [],
            totalOrders: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('customers').doc(userRecord.uid).set(newCustomerData);

        return NextResponse.json({
            success: true,
            data: {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName,
            }
        });
    } catch (error: any) {
        console.error('Error in /api/auth/register:', error);
        return NextResponse.json({ success: false, error: error.message || 'Registration failed' }, { status: 500 });
    }
}
