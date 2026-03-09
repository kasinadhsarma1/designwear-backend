import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

export async function GET(req: NextRequest) {
    try {
        const prodSnap = await db.collection('products').get();
        const ordSnap = await db.collection('orders').get();

        return NextResponse.json({
            total_products: prodSnap.size,
            total_orders: ordSnap.size,
            total_customers: 0, // Using anonymous firebaseUid accounts currently, no unified standard table
            database_size: 0 // Cannot easily compute firestore bucket size from Admin SDK without GCP console
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
