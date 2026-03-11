import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

const FIREBASE_PROJECT_ID =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    'designwear-app-8984';

function initializeFirebaseAdmin() {
    if (admin.apps.length) return;

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        // Build-time: env vars not available yet — initialize with just projectId so the
        // module loads without crashing. Runtime requests will have the real credentials.
        logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY not set — Firebase Admin running in limited mode');
        try {
            admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
        } catch (e) {
            // Already initialized — ignore
        }
        return;
    }

    try {
        let parsedKey = serviceAccountKey.trim();

        // Strip outer single-quotes (local .env.local format)
        if (parsedKey.startsWith("'") && parsedKey.endsWith("'")) {
            parsedKey = parsedKey.slice(1, -1);
        }
        // Strip outer double-quotes (Vercel sometimes wraps values)
        if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
            parsedKey = parsedKey.slice(1, -1);
        }

        // Normalize newlines: handle both \\n (double-escaped) and \n (single-escaped)
        parsedKey = parsedKey
            .replace(/\\\\n/g, '\n')   // .env.local double-escape → actual newline
            .replace(/\\n/g, '\n');    // Vercel single-escape → actual newline

        const serviceAccount = JSON.parse(parsedKey);

        // Belt-and-suspenders: ensure private_key has real newlines after JSON parse
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || FIREBASE_PROJECT_ID,
        });

        logger.info('Firebase Admin initialized successfully');
    } catch (e) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY — check Vercel env var format. Error:', e);
        // Last-resort fallback — at least prevents a full crash
        try {
            admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
        } catch {
            // Already initialized
        }
    }
}

initializeFirebaseAdmin();

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
