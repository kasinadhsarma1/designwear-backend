import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

// Get products
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get('limit') || '50';
        const status = searchParams.get('status');

        let productsRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('products');

        if (status) {
            productsRef = productsRef.where('status', '==', status);
        }

        productsRef = productsRef.orderBy('createdAt', 'desc').limit(Number(limitStr));

        const snapshot = await productsRef.get();
        const products: Record<string, unknown>[] = [];

        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({
            success: true,
            products,
            total: snapshot.size,
            limit: Number(limitStr)
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// Create product
export async function POST(req: NextRequest) {
    try {
        const { name, sku, price, stock, category_id, description } = await req.json();

        if (!name || !price) {
            return NextResponse.json({ success: false, error: 'Missing req fields' }, { status: 400 });
        }

        const newProductRef = db.collection('products').doc();

        const payload = {
            name,
            sku: sku || '',
            price: Number(price),
            stock: stock || 0,
            category_id: category_id || null,
            description: description || '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await newProductRef.set(payload);
        const savedSnap = await newProductRef.get();

        return NextResponse.json({
            success: true,
            data: { id: newProductRef.id, ...savedSnap.data() }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
