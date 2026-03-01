import { useEffect, useState } from 'react'

interface SyncStatus {
    lastSync: string
    pendingItems: number
    failedItems: number
    status: 'idle' | 'syncing' | 'error'
}

export default function syncStatusWidget() {
    return {
        name: 'sync-status',
        component: SyncStatusComponent,
        layout: { width: 'medium', height: 'small' },
    }
}

function SyncStatusComponent() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        lastSync: '',
        pendingItems: 0,
        failedItems: 0,
        status: 'idle',
    })

    useEffect(() => {
        const fetchSyncStatus = async () => {
            try {
                const response = await fetch('/api/sync/status')
                const data = await response.json()
                setSyncStatus(data)
            } catch (error) {
                console.error('Failed to fetch sync status:', error)
            }
        }

        fetchSyncStatus()
        const interval = setInterval(fetchSyncStatus, 10000) // Check every 10 seconds

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = () => {
        switch (syncStatus.status) {
            case 'syncing':
                return '#3b82f6'
            case 'error':
                return '#ef4444'
            default:
                return '#22c55e'
        }
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Sync Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(),
                        }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{syncStatus.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Pending</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{syncStatus.pendingItems}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Failed</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                            {syncStatus.failedItems}
                        </p>
                    </div>
                </div>
                {syncStatus.lastSync && (
                    <p style={{ fontSize: '0.75rem', color: '#999' }}>
                        Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    )
}
