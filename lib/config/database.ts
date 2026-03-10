import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Prevent duplicate initialization during hot reloads
if (!admin.apps.length) {
    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        let credential;

        if (serviceAccountKey) {
            try {
                let parsedKey = serviceAccountKey.trim();

                // Strip outer single-quotes if present (added in local .env.local for shell safety)
                if (parsedKey.startsWith("'") && parsedKey.endsWith("'")) {
                    parsedKey = parsedKey.slice(1, -1);
                }
                // Strip outer double-quotes if Vercel wrapped the value
                if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
                    parsedKey = parsedKey.slice(1, -1);
                }

                // Normalize newlines in the private_key field.
                // Vercel may store \\n (double-escaped) or the literal chars \n.
                // We need actual newlines for the PEM to parse correctly.
                parsedKey = parsedKey
                    .replace(/\\\\n/g, '\n')   // \\n → actual newline (from .env.local double escaping)
                    .replace(/\\n/g, '\n');     // \n  → actual newline (from Vercel single escaping)

                const serviceAccount = JSON.parse(parsedKey);

                // Vercel sometimes also stores private_key with literal \n — fix it
                if (serviceAccount.private_key && !serviceAccount.private_key.includes('\n')) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }

                credential = admin.credential.cert(serviceAccount);
                logger.info('Firebase Admin initialized successfully');
            } catch (e) {
                logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY — check Vercel env var format', e);
                credential = admin.credential.applicationDefault();
            }
        } else {
            logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY not set — using applicationDefault()');
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
