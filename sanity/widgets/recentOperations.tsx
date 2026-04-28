import { useEffect, useState } from 'react'
import { Box, Card, Text, Badge, Stack, Flex } from '@sanity/ui'

interface Operation {
  id: string
  type: string
  document: string
  timestamp: string
  status: 'success' | 'failed'
}

const COL = { type: '20%', document: '40%', time: '25%', status: '15%' }

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
    <Card padding={4} height="fill">
      <Stack space={4}>
        <Text size={2} weight="semibold">
          Recent Database Operations
        </Text>

        {operations.length === 0 ? (
          <Text size={1} muted>
            No recent operations
          </Text>
        ) : (
          <Box style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <Stack space={1}>
              {/* Header row */}
              <Flex padding={2} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                <Box style={{ width: COL.type }}>
                  <Text size={0} weight="semibold" muted>TYPE</Text>
                </Box>
                <Box style={{ width: COL.document }}>
                  <Text size={0} weight="semibold" muted>DOCUMENT</Text>
                </Box>
                <Box style={{ width: COL.time }}>
                  <Text size={0} weight="semibold" muted>TIME</Text>
                </Box>
                <Box style={{ width: COL.status }}>
                  <Text size={0} weight="semibold" muted>STATUS</Text>
                </Box>
              </Flex>

              {/* Data rows */}
              {operations.map((op) => (
                <Flex key={op.id} padding={2} align="center">
                  <Box style={{ width: COL.type }}>
                    <Text size={1}>{op.type}</Text>
                  </Box>
                  <Box style={{ width: COL.document }}>
                    <Text size={1}>{op.document}</Text>
                  </Box>
                  <Box style={{ width: COL.time }}>
                    <Text size={1} muted>
                      {new Date(op.timestamp).toLocaleTimeString()}
                    </Text>
                  </Box>
                  <Box style={{ width: COL.status }}>
                    <Badge
                      tone={op.status === 'success' ? 'positive' : 'critical'}
                      padding={2}
                      fontSize={0}
                    >
                      {op.status}
                    </Badge>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  )
}
