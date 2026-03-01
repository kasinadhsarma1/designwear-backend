import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const apiKey = process.env.FIREBASE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FIREBASE_API_KEY in backend configuration. Cannot verify credentials.");
        }

        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: data.error?.message || 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: {
                token: data.idToken,           // Session token for headers
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                uid: data.localId,
                email: data.email,
                name: data.displayName
            }
        });
    } catch (error: any) {
        console.error('Error in /api/auth/login:', error);
        return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
    }
}
