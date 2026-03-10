import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

/**
 * GET /api/categories
 * Returns the categories list from Firestore.
 * Response shape matches Flutter Category.fromApiMap expectations.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get('limit') || '100';

        const snapshot = await db.collection('categories')
            .orderBy('title', 'asc')
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
                imageUrl: d.imageUrl || null,
                // Keep all original fields
                ...d,
            });
        });

        return NextResponse.json({
            success: true,
            data,
            total: snapshot.size,
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/categories
 * Create a new category document in Firestore.
 */
export async function POST(req: NextRequest) {
    try {
        const { title, slug, description, imageUrl } = await req.json();

        if (!title) {
            return NextResponse.json({ success: false, error: 'Category title is required' }, { status: 400 });
        }

        const newCatRef = db.collection('categories').doc();

        const payload = {
            title,
            name: title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            description: description || '',
            imageUrl: imageUrl || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await newCatRef.set(payload);
        const saved = await newCatRef.get();

        return NextResponse.json({
            success: true,
            data: { id: newCatRef.id, ...saved.data() }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
