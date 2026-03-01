import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productRef = db.collection('products').doc(id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { id: productSnap.id, ...productSnap.data() }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const productRef = db.collection('products').doc(id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString()
        };

        // Remove ID if passed in body to prevent overwriting document name data
        delete updateData.id;

        await productRef.update(updateData);

        const updatedSnap = await productRef.get();

        return NextResponse.json({
            success: true,
            data: { id: updatedSnap.id, ...updatedSnap.data() }
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productRef = db.collection('products').doc(id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        await productRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
