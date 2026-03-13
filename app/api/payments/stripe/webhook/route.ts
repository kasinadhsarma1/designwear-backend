import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata.order_id;

            if (orderId) {
                await db.collection('orders').doc(orderId).update({
                    status: 'PAID',
                    paymentStatus: 'success',
                    stripePaymentIntentId: paymentIntent.id,
                    updatedAt: new Date().toISOString()
                });
                console.log(`Order ${orderId} marked as PAID`);
            }
            break;
            
        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object as Stripe.PaymentIntent;
            const failedOrderId = failedIntent.metadata.order_id;
            
            if (failedOrderId) {
                await db.collection('orders').doc(failedOrderId).update({
                    status: 'PAYMENT_FAILED',
                    paymentStatus: 'failed',
                    updatedAt: new Date().toISOString()
                });
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

