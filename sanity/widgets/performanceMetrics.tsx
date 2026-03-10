import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceData {
    timestamp: string
    responseTime: number
    queriesPerSecond: number
}

export default function performanceMetricsWidget() {
    return {
        name: 'performance-metrics',
        component: PerformanceMetricsComponent,
        layout: { width: 'large', height: 'medium' },
    }
}

function PerformanceMetricsComponent() {
    const [metrics, setMetrics] = useState<PerformanceData[]>([])

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/metrics/performance')
                const data = await response.json()
                setMetrics(data)
            } catch (error) {
                console.error('Failed to fetch performance metrics:', error)
            }
        }

        fetchMetrics()
        const interval = setInterval(fetchMetrics, 20000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Performance Metrics
            </h2>
            {metrics.length === 0 ? (
                <p style={{ color: '#666' }}>Loading metrics...</p>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value: string | number | Date) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            labelFormatter={(value: any) => new Date(value).toLocaleString()}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [`${value}ms`, 'Response Time']}
                        />
                        <Line
                            type="monotone"
                            dataKey="responseTime"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
