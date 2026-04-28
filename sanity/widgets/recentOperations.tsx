import { useEffect, useState } from 'react'
import { Box, Card, Text, Badge, Stack, Table, TableRow, TableCell, TableHead, TableBody } from '@sanity/ui'

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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Text size={1} weight="semibold">Type</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={1} weight="semibold">Document</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={1} weight="semibold">Time</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={1} weight="semibold">Status</Text>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      <Text size={1}>{op.type}</Text>
                    </TableCell>
                    <TableCell>
                      <Text size={1}>{op.document}</Text>
                    </TableCell>
                    <TableCell>
                      <Text size={1} muted>
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge
                        tone={op.status === 'success' ? 'positive' : 'critical'}
                        padding={2}
                        fontSize={0}
                      >
                        {op.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    </Card>
  )
}
