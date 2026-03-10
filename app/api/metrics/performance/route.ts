import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // As Firestore doesn't provide granular system response time tables out of the box,
        // we'll return the mock data format expected by the dashboard as done in the fallback
        return NextResponse.json([
            {
                timestamp: new Date().toISOString(),
                response_time: 45,
                queries_per_second: 12,
            },
        ]);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}
