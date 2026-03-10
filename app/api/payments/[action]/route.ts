import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

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

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);

        // Checkout initialization
        if (url.pathname.includes('/checkout')) {
            const firebaseUid = await getFirebaseUid(req);
            if (!firebaseUid) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }

            const { order_id } = await req.json();
            if (!order_id) {
                return NextResponse.json({ success: false, error: 'order_id is required' }, { status: 400 });
            }

            const orderRef = db.collection('orders').doc(order_id);
            const orderSnap = await orderRef.get();

            if (!orderSnap.exists) {
                return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
            }

            const order = orderSnap.data();
            if (order?.firebaseUid !== firebaseUid) {
                return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
            }

            const merchantId = process.env.GOKWIK_MERCHANT_ID || '';

            const payload = {
                merchant_id: merchantId,
                order_id: orderSnap.id,
                order_number: order?.orderNumber,
                amount: parseFloat(order?.totalAmount),
                timestamp: Date.now()
            };

            const sessionId = `gk_sess_${crypto.randomBytes(12).toString('hex')}`;

            return NextResponse.json({
                success: true,
                session_id: sessionId,
                payload
            });
        }

        // Webhook receiver
        if (url.pathname.includes('/webhook/gokwik')) {
            const { order_id, status } = await req.json();

            if (!order_id || !status) {
                return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
            }

            let paymentStatus = 'pending';
            let orderStatus = 'pending';

            if (status === 'success') {
                paymentStatus = 'paid';
                orderStatus = 'processing';
            } else if (status === 'failed') {
                paymentStatus = 'failed';
                orderStatus = 'cancelled';
            }

            const orderRef = db.collection('orders').doc(order_id);
            const snap = await orderRef.get();

            if (!snap.exists) {
                return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
            }

            await orderRef.set({
                paymentStatus,
                status: orderStatus,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            const updatedSnap = await orderRef.get();

            return NextResponse.json({ success: true, order: { id: updatedSnap.id, ...updatedSnap.data() } });
        }

        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    } catch (error) {
        console.error('Payment route error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
