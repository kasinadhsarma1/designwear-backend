import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Prevent duplicate initialization during hot reloads
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.GCP_PROJECT_ID || 'designwear-app-8984'
            // Important: We rely on the GOOGLE_APPLICATION_CREDENTIALS environment variable
            // pointing to the service account JSON for local dev.
        });
        logger.info('Firebase Admin initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
} else {
    logger.info('Firebase Admin already initialized');
}

export const db = admin.firestore();

export async function connectDatabase(): Promise<void> {
    // Firestore does not require explicit connection pooling setup like PG.
    // This function is kept for backwards compatibility with server.ts startup logic.
    logger.info('Firestore Database connected');
}

export async function closeDatabaseConnection(): Promise<void> {
    // Firestore handles its own connection lifecycle.
    logger.info('Database pool closed (No-op for Firestore)');
}
