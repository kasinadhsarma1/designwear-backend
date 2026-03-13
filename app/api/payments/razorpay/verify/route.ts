import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/config/database';
import * as admin from 'firebase-admin';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-31',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

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

            // Sync to Sanity Studio
            try {
                if (!process.env.SANITY_API_TOKEN) {
                    console.warn('SANITY_API_TOKEN is not set. Skipping Sanity sync.');
                } else {
                    const orderDoc = await db.collection('orders').doc(targetOrderId).get();
                    if (orderDoc.exists) {
                        const orderData = orderDoc.data()!;
                        
                        // Ensure Customer Exists in Sanity
                        const customerId = `customer-${orderData.firebaseUid}`;
                        const customerDoc = await db.collection('customers').doc(orderData.firebaseUid).get();
                        const customerData = customerDoc.exists ? customerDoc.data() : null;

                        const customerName = customerData?.name || orderData.shippingAddress?.name || 'Guest User';
                        const customerEmail = customerData?.email || 'guest@example.com';
                        const customerPhone = customerData?.phone || '';

                        await sanityClient.createIfNotExists({
                            _id: customerId,
                            _type: 'customer',
                            name: customerName,
                            email: customerEmail,
                            phone: customerPhone,
                            totalOrders: (customerData?.totalOrders || 0) + 1,
                            totalSpent: (customerData?.totalSpent || 0) + (orderData.totalAmount || 0),
                        });

                        // Map Items
                        const sanityItems = (orderData.items || []).map((item: any) => ({
                            _key: crypto.randomBytes(8).toString('hex'),
                            product: item.productId ? { _type: 'reference', _ref: item.productId } : undefined,
                            quantity: item.quantity || 1,
                            size: item.size || '',
                            color: item.color || '',
                            price: item.price || 0
                        }));

                        // Create Order in Sanity
                        const sanityOrder = {
                            _type: 'order',
                            orderNumber: orderData.orderNumber || targetOrderId,
                            customer: {
                                _type: 'reference',
                                _ref: customerId
                            },
                            items: sanityItems,
                            totalAmount: orderData.totalAmount || 0,
                            status: 'processing',
                            paymentStatus: 'paid',
                            shippingAddress: {
                                street: orderData.shippingAddress?.address || '',
                                city: orderData.shippingAddress?.city || '',
                                state: orderData.shippingAddress?.state || '',
                                zipCode: orderData.shippingAddress?.pincode || '',
                                country: 'India'
                            },
                            orderDate: orderData.createdAt || new Date().toISOString()
                        };

                        await sanityClient.create(sanityOrder);
                        console.log(`Order ${targetOrderId} synced to Sanity Studio`);
                    }
                }
            } catch (sanityError: any) {
                console.error('Failed to sync order to Sanity:', sanityError.message || sanityError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Razorpay verify error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
