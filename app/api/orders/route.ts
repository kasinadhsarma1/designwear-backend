import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';

async function getFirebaseTokenInfo(req: NextRequest): Promise<{ uid: string | null; error?: any }> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return { uid: null, error: 'Missing Bearer token' };

    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        return { uid: decodedToken.uid };
    } catch (error: any) {
        console.error('Firebase ID token verification failed:', error);
        return { uid: null, error: error.message || 'Token verification failed' };
    }
}

// Create order
export async function POST(req: NextRequest) {
    try {
        const { uid: firebaseUid, error: authError } = await getFirebaseTokenInfo(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized', details: authError }, { status: 401 });
        }

        const body = await req.json();
        const {
            orderNumber: providedOrderNumber,
            totalAmount: providedTotalAmount,
            status = 'PENDING',
            paymentMethod = 'STRIPE',
            shippingAddress,
            billingAddress,
            items
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Items are required' }, { status: 400 });
        }

        if (!shippingAddress) {
            return NextResponse.json({ success: false, error: 'Shipping address is required' }, { status: 400 });
        }

        // Generate order number if not provided (e.g., DW-123456789)
        const orderNumber = providedOrderNumber || `DW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Calculate total amount if not provided (fallback)
        // In a real production app, we should ALWAYS calculate this on the backend based on product prices in the DB
        let totalAmount = providedTotalAmount;
        if (totalAmount === undefined || totalAmount === null) {
            totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
        }

        const newOrderRef = db.collection('orders').doc();

        const orderData = {
            firebaseUid,
            orderNumber,
            totalAmount,
            status,
            paymentMethod,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            items,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await newOrderRef.set(orderData);

        return NextResponse.json({
            success: true,
            data: { id: newOrderRef.id, ...orderData }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// Get user orders
export async function GET(req: NextRequest) {
    try {
        const { uid: firebaseUid } = await getFirebaseTokenInfo(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const snapshot = await db.collection('orders')
            .where('firebaseUid', '==', firebaseUid)
            .get();

        const orders: Record<string, unknown>[] = [];
        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
