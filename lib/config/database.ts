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

        // Strategy: parse first WITHOUT pre-processing.
        // Pre-processing newlines before JSON.parse is wrong — it breaks valid JSON
        // that already contains proper \n escape sequences.
        let serviceAccount: Record<string, unknown>;
        try {
            serviceAccount = JSON.parse(parsedKey);
        } catch {
            // Fallback: the value was pasted into Vercel with actual raw newline characters
            // inside the JSON string (shows as "Bad control character" error).
            // Escape all raw newlines so JSON.parse can succeed.
            const escaped = parsedKey
                .replace(/\r\n/g, '\\n')   // Windows CRLF
                .replace(/\r/g, '\\n')     // Old Mac CR
                .replace(/\n/g, '\\n');    // Unix LF
            serviceAccount = JSON.parse(escaped);
        }

        // Fix private_key AFTER parsing:
        // .env.local via dotenv → JSON.parse gives literal \n (backslash+n, 2 chars).
        // Firebase Admin needs actual newline chars in the PEM. Convert them.
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = (serviceAccount.private_key as string).replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: (serviceAccount.project_id as string) || FIREBASE_PROJECT_ID,
        });

        logger.info('Firebase Admin initialized successfully');
    } catch (e) {
        logger.error('Failed to initialize Firebase Admin — check FIREBASE_SERVICE_ACCOUNT_KEY format:', e);
        // Last-resort fallback — at least prevents a full crash
        try {
            admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
        } catch {
            // Already initialized — ignore
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
