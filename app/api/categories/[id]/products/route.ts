import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

/**
 * GET /api/categories/[id]/products
 * Returns products belonging to a specific category.
 * Response shape matches Flutter Product.fromApiMap expectations.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get('limit') || '50';

        const snapshot = await db.collection('products')
            .where('categoryId', '==', id)
            .orderBy('createdAt', 'desc')
            .limit(Number(limitStr))
            .get();

        const data: Record<string, unknown>[] = [];

        snapshot.forEach((doc) => {
            const d = doc.data();
            data.push({
                id: doc.id,
                title: d.title || d.name || '',
                slug: d.slug || '',
                description: d.description || '',
                price: d.price || 0,
                imageUrl: d.imageUrl || (Array.isArray(d.images) && d.images.length > 0 ? d.images[0]?.asset?._ref : null),
                categoryId: d.categoryId || d.category_id || id,
                stockStatus: d.stockStatus || (d.stock > 0 ? 'inStock' : 'outOfStock'),
                featured: d.featured || false,
                ...d,
            });
        });

        return NextResponse.json({
            success: true,
            data,
            total: snapshot.size,
            categoryId: id,
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
