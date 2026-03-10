import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export async function GET() {
    try {
        const healthStatus = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: 'unknown'
            }
        };

        try {
            // Firebase Admin initialization check
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: process.env.GCP_PROJECT_ID || 'designwear-app-8984'
                });
            }

            const db = admin.firestore();
            await db.listCollections();
            healthStatus.services.database = 'connected';
        } catch (dbError: unknown) {
            console.error('Health check: Database connection failed', dbError);
            healthStatus.services.database = 'disconnected';
            healthStatus.status = 'degraded';
        }

        const statusCode = healthStatus.status === 'ok' ? 200 : 503;

        return NextResponse.json(healthStatus, { status: statusCode });
    } catch (error: unknown) {
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Internal server error during health check'
        }, { status: 500 });
    }
}
