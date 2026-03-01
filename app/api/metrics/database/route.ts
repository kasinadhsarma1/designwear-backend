import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

export async function GET(req: NextRequest) {
    try {
        const prodCount = await db.collection('products').count().get();
        const ordCount = await db.collection('orders').count().get();

        return NextResponse.json({
            total_products: prodCount.data().count,
            total_orders: ordCount.data().count,
            total_customers: 0, // Using anonymous firebaseUid accounts currently, no unified standard table
            database_size: 0 // Cannot easily compute firestore bucket size from Admin SDK without GCP console
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
