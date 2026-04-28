import { useEffect, useState } from 'react'
import { Box, Card, Flex, Text, Badge, Spinner, Stack } from '@sanity/ui'

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
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card padding={4} height="fill">
      <Stack space={4}>
        <Text size={2} weight="semibold">
          AlloyDB Status
        </Text>
        {loading ? (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text size={1} muted>
              Checking connection…
            </Text>
          </Flex>
        ) : (
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: status.connected ? '#22c55e' : '#ef4444',
                  flexShrink: 0,
                }}
              />
              <Badge tone={status.connected ? 'positive' : 'critical'} padding={2} fontSize={1}>
                {status.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </Flex>
            {status.responseTime !== undefined && (
              <Text size={1} muted>
                Response time: {status.responseTime}ms
              </Text>
            )}
            {status.error && (
              <Text size={1} style={{ color: '#ef4444' }}>
                {status.error}
              </Text>
            )}
            <Text size={0} muted>
              Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
