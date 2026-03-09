import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Prevent duplicate initialization during hot reloads
if (!admin.apps.length) {
    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        let credential;

        if (serviceAccountKey) {
            try {
                // If it's a stringified JSON string inside quotes, we need to handle it carefully
                let parsedKey = serviceAccountKey;
                if (parsedKey.startsWith("'") && parsedKey.endsWith("'")) {
                    parsedKey = parsedKey.slice(1, -1);
                }

                // Handle unescaped newlines which cause JSON.parse to crash or PEM parsing to fail
                parsedKey = parsedKey.replace(/\\\\n/g, '\\n');

                const serviceAccount = JSON.parse(parsedKey);
                credential = admin.credential.cert(serviceAccount);
            } catch (e) {
                logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to applicationDefault()', e);
                credential = admin.credential.applicationDefault();
            }
        } else {
            credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
            credential,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'designwear-app-8984'
        });
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
