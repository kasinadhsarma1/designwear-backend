import { definePlugin } from 'sanity'
import { useEffect, useState } from 'react'

interface DatabaseStatus {
    connected: boolean
    lastChecked: string
    responseTime?: number
    error?: string
}

export default function databaseStatusWidget() {
    return {
        name: 'database-status',
        component: DatabaseStatusComponent,
        layout: { width: 'medium', height: 'small' },
    }
}

function DatabaseStatusComponent() {
    const [status, setStatus] = useState<DatabaseStatus>({
        connected: false,
        lastChecked: new Date().toISOString(),
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/health/database')
                const data = await response.json()
                setStatus({
                    connected: data.connected,
                    lastChecked: new Date().toISOString(),
                    responseTime: data.responseTime,
                })
            } catch (error) {
                setStatus({
                    connected: false,
                    lastChecked: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error',
                })
            } finally {
                setLoading(false)
            }
        }

        checkStatus()
        const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                AlloyDB Status
            </h2>
            {loading ? (
                <p>Checking connection...</p>
            ) : (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: status.connected ? '#22c55e' : '#ef4444',
                            }}
                        />
                        <span style={{ fontWeight: 'bold' }}>
                            {status.connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    {status.responseTime && (
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                            Response time: {status.responseTime}ms
                        </p>
                    )}
                    {status.error && (
                        <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>Error: {status.error}</p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                        Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    )
}
