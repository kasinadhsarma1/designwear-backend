import { useEffect, useState } from 'react'

interface Operation {
    id: string
    type: string
    document: string
    timestamp: string
    status: 'success' | 'failed'
}

export default function recentOperationsWidget() {
    return {
        name: 'recent-operations',
        component: RecentOperationsComponent,
        layout: { width: 'large', height: 'medium' },
    }
}

function RecentOperationsComponent() {
    const [operations, setOperations] = useState<Operation[]>([])

    useEffect(() => {
        const fetchOperations = async () => {
            try {
                const response = await fetch('/api/operations/recent?limit=10')
                const data = await response.json()
                setOperations(data)
            } catch (error) {
                console.error('Failed to fetch operations:', error)
            }
        }

        fetchOperations()
        const interval = setInterval(fetchOperations, 15000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Recent Database Operations
            </h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {operations.length === 0 ? (
                    <p style={{ color: '#666' }}>No recent operations</p>
                ) : (
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Document</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Time</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op) => (
                                <tr key={op.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.5rem' }}>{op.type}</td>
                                    <td style={{ padding: '0.5rem' }}>{op.document}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {new Date(op.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span
                                            style={{
                                                color: op.status === 'success' ? '#22c55e' : '#ef4444',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {op.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
