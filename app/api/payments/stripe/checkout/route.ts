import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

        // Create Stripe PaymentIntent or Checkout Session
        // For mobile apps, a PaymentIntent is often easier to integrate with the Payment Sheet SDK
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order?.totalAmount * 100), // Stripe expects cents
            currency: 'inr',
            metadata: {
                order_id: order_id,
                firebaseUid: firebaseUid
            },
            payment_method_types: ['card'],
        });

        return NextResponse.json({
            success: true,
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });

    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
