import { createClient } from '@sanity/client';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

interface SyncResult {
    success: boolean;
    message: string;
}

export async function checkDocumentExists(sanityDocumentId: string): Promise<boolean> {
    try {
        const count = await client.fetch(`count(*[_id == $id])`, { id: sanityDocumentId });
        return count > 0;
    } catch (error) {
        logger.error(`Error checking document existence for ${sanityDocumentId}:`, error);
        return false;
    }
}

export async function syncProductToDatabase(sanityDocumentId: string): Promise<SyncResult> {
    try {
        const product = await client.fetch(
            `*[_type == "product" && _id == $id][0]{
        _id,
        name,
        slug,
        description,
        sku,
        price,
        compareAtPrice,
        stock,
        lowStockThreshold,
        status,
        featured,
        "categoryId": category->_id,
        "supplierId": supplier->_id,
        sizes,
        colors,
        images
      }`,
            { id: sanityDocumentId }
        );

        if (!product) {
            throw new Error(`Product ${sanityDocumentId} not found in Sanity`);
        }

        const productRef = db.collection('products').doc(sanityDocumentId);

        await productRef.set({
            sanityId: sanityDocumentId,
            name: product.name,
            slug: product.slug?.current || '',
            description: product.description || '',
            sku: product.sku || '',
            price: product.price || 0,
            compareAtPrice: product.compareAtPrice || null,
            stock: product.stock || 0,
            lowStockThreshold: product.lowStockThreshold || 0,
            status: product.status || 'draft',
            featured: product.featured || false,
            categoryId: product.categoryId || null,
            supplierId: product.supplierId || null,
            sizes: product.sizes || [],
            colors: product.colors || [],
            images: product.images || [],
            syncedToDb: true,
            syncedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        logger.info(`Upserted product ${sanityDocumentId} into Firestore db`);

        await logOperation('sync', 'product', sanityDocumentId, null);
        return { success: true, message: `Product ${sanityDocumentId} synced successfully` };
    } catch (error: any) {
        logger.error(`Failed to sync product ${sanityDocumentId}:`, error);
        await logOperation('sync', 'product', sanityDocumentId, error);
        return { success: false, message: error.message || `Failed to sync product ${sanityDocumentId}` };
    }
}

async function logOperation(
    operationType: string,
    documentType: string,
    documentId: string,
    error: any
): Promise<void> {
    try {
        await db.collection('operationLogs').add({
            operationType,
            documentType,
            documentId,
            error: error ? error.message : null,
            createdAt: new Date().toISOString()
        });
    } catch (err) {
        logger.error('Failed to log operation:', err);
    }
}
