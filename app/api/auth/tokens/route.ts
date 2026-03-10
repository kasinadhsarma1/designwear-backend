import { NextResponse, NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import '@/lib/config/database'; // ensure Firebase Admin is initialized

/**
 * GET /api/auth/tokens
 * Returns basic token/session metadata for the authenticated user.
 * Requires a valid Firebase ID token in the Authorization header.
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Authorization header required' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');

        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Retrieve user record to get refresh token revocation time
        const userRecord = await admin.auth().getUser(uid);

        return NextResponse.json({
            success: true,
            data: {
                uid,
                email: userRecord.email,
                tokensValidAfterTime: userRecord.tokensValidAfterTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                creationTime: userRecord.metadata.creationTime,
            }
        });
    } catch (error: unknown) {
        console.error('Error in GET /api/auth/tokens:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve tokens';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

/**
 * DELETE /api/auth/tokens
 * Revokes all tokens for the authenticated user (same as /api/auth/token/revoke).
 */
export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Authorization header required' }, { status: 401 });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await admin.auth().revokeRefreshTokens(uid);

        return NextResponse.json({
            success: true,
            message: `All tokens revoked for user ${uid}.`
        });
    } catch (error: unknown) {
        console.error('Error in DELETE /api/auth/tokens:', error);
        const errorMessage = error instanceof Error ? error.message : 'Token revocation failed';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
