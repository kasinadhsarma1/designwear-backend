import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const limitStr = url.searchParams.get('limit') || '10';

        const snapshot = await db.collection('operationLogs')
            .orderBy('createdAt', 'desc')
            .limit(Number(limitStr))
            .get();

        const logs: any[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                type: data.operationType,
                document: `${data.documentType}:${data.documentId}`,
                timestamp: data.createdAt,
                status: data.error ? 'failed' : 'success'
            });
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json([]);
    }
}
