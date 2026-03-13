import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
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

export async function POST(req: NextRequest) {
    try {
        const firebaseUid = await getFirebaseUid(req);
        if (!firebaseUid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required' },
                { status: 400 }
            );
        }

        // Verify HMAC-SHA256 signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('Razorpay signature mismatch!');
            return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
        }

        // Signature is valid — find the Firestore order by its Razorpay order ID (stored in receipt)
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef
            .where('firebaseUid', '==', firebaseUid)
            .get();

        // Find the order whose Razorpay receipt matches
        let targetOrderId: string | null = null;
        snapshot.forEach((doc) => {
            // The receipt was set to the Firestore order ID during order creation
            // We stored the razorpay_order_id for lookup
            const data = doc.data();
            if (data.razorpayOrderId === razorpay_order_id) {
                targetOrderId = doc.id;
            }
        });

        // Update order status to PAID
        if (targetOrderId) {
            await db.collection('orders').doc(targetOrderId).update({
                status: 'PAID',
                paymentStatus: 'success',
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                updatedAt: new Date().toISOString(),
            });
            console.log(`Order ${targetOrderId} marked as PAID`);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Razorpay verify error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
