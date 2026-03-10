import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';

// Extract uid from Bearer token
async function getFirebaseUid(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch {
        return null;
    }
}

// Create order
export async function POST(req: NextRequest) {
    try {
        const firebaseUid = await getFirebaseUid(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const {
            orderNumber,
            totalAmount,
            status = 'PENDING',
            paymentMethod,
            shippingAddress,
            billingAddress,
            items
        } = await req.json();

        if (!orderNumber || !totalAmount || !items || !Array.isArray(items)) {
            return NextResponse.json({ success: false, error: 'Missing req fields' }, { status: 400 });
        }

        const newOrderRef = db.collection('orders').doc();

        await newOrderRef.set({
            firebaseUid,
            orderNumber,
            totalAmount,
            status,
            paymentMethod,
            shippingAddress,
            billingAddress,
            items,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const newOrderSnap = await newOrderRef.get();

        return NextResponse.json({
            success: true,
            data: { id: newOrderRef.id, ...newOrderSnap.data() }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// Get user orders
export async function GET(req: NextRequest) {
    try {
        const firebaseUid = await getFirebaseUid(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await db.collection('orders')
            .where('firebaseUid', '==', firebaseUid)
            .orderBy('createdAt', 'desc')
            .get();

        const orders: Record<string, unknown>[] = [];
        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
