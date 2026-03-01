import { NextResponse, NextRequest } from 'next/server';
import { syncProductToDatabase } from '@/lib/services/syncService';
import { db } from '@/lib/config/database';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const action = url.pathname.split('/').pop();

        if (action === 'status') {
            const pendingQuery = await db.collection('products')
                .where('syncedToDb', 'in', [false, null])
                .count()
                .get();

            const failedQuery = await db.collection('operationLogs')
                .where('operationType', '==', 'sync')
                .where('error', '!=', null)
                .count()
                .get();

            const snapshot = await db.collection('products')
                .where('syncedToDb', '==', true)
                .orderBy('syncedAt', 'desc')
                .limit(1)
                .get();

            const lastSync = snapshot.empty ? null : snapshot.docs[0].data().syncedAt;

            return NextResponse.json({
                status: 'idle',
                pendingItems: pendingQuery.data().count,
                failedItems: failedQuery.data().count,
                lastSync
            });
        }

        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    } catch (error: any) {
        console.error('Status fetch error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const action = url.pathname.split('/').pop();

        if (action === 'trigger') {
            const { documentId, documentType } = await req.json();

            if (documentType === 'product') {
                await syncProductToDatabase(documentId);
                return NextResponse.json({ message: 'Sync triggered successfully', documentId });
            } else {
                return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });
            }
        }

        if (action === 'webhook') {
            const { _type, _id } = await req.json();

            if (_type === 'product') {
                await syncProductToDatabase(_id);
            }

            return NextResponse.json({ success: true, documentId: _id });
        }

        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

    } catch (error: any) {
        console.error('Sync POST error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
