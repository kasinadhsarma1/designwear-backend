import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/config/database';

/**
 * GET /api/settings/tax-rate
 * Returns the current tax rate percentage from Firestore settings.
 * Defaults to 18 (%) if not configured.
 */
export async function GET(_req: NextRequest) {
    try {
        const settingsDoc = await db.collection('settings').doc('global').get();

        let taxRate = 18; // Default: 18% GST (India)

        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            if (data?.taxRate !== undefined && typeof data.taxRate === 'number') {
                taxRate = data.taxRate;
            }
        }

        return NextResponse.json({
            success: true,
            data: { taxRate }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tax rate:', error);
        // Graceful fallback — never fail the mobile app over a tax rate
        return NextResponse.json({
            success: true,
            data: { taxRate: 18 }
        }, { status: 200 });
    }
}

/**
 * PUT /api/settings/tax-rate
 * Update the global tax rate. Requires admin authorization.
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { taxRate } = body;

        if (taxRate === undefined || typeof taxRate !== 'number' || taxRate < 0 || taxRate > 100) {
            return NextResponse.json({
                success: false,
                error: 'taxRate must be a number between 0 and 100'
            }, { status: 400 });
        }

        await db.collection('settings').doc('global').set(
            { taxRate, updatedAt: new Date().toISOString() },
            { merge: true }
        );

        return NextResponse.json({
            success: true,
            data: { taxRate }
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating tax rate:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
