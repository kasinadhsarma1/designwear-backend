export interface Product {
    id: number
    sanityId: string
    name: string
    slug: string
    description?: string
    sku: string
    price: number
    compareAtPrice?: number
    stock: number
    lowStockThreshold: number
    status: 'active' | 'draft' | 'archived'
    featured: boolean
    categoryId?: number
    supplierId?: number
    sizes?: string[]
    colors?: string[]
    images?: any[]
    syncedToDb: boolean
    syncedAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: number
    sanityId: string
    name: string
    slug: string
    description?: string
    imageUrl?: string
    parentId?: number
    createdAt: Date
    updatedAt: Date
}

export interface Order {
    id: number
    sanityId: string
    orderNumber: string
    customerId: number
    totalAmount: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    shippingAddress?: any
    notes?: string
    orderDate: Date
    createdAt: Date
    updatedAt: Date
}

export interface Customer {
    id: number
    sanityId: string
    name: string
    email: string
    phone?: string
    addresses?: any[]
    totalOrders: number
    totalSpent: number
    registeredAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface SyncStatus {
    lastSync: string
    pendingItems: number
    failedItems: number
    status: 'idle' | 'syncing' | 'error'
}

export interface DatabaseStatus {
    connected: boolean
    lastChecked: string
    responseTime?: number
    error?: string
}
