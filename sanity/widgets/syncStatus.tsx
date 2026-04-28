import { useEffect, useState } from 'react'
import { Card, Flex, Text, Badge, Stack, Grid } from '@sanity/ui'

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
    const interval = setInterval(fetchSyncStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const statusTone =
    syncStatus.status === 'error'
      ? 'critical'
      : syncStatus.status === 'syncing'
        ? 'primary'
        : 'positive'

  return (
    <Card padding={4} height="fill">
      <Stack space={4}>
        <Flex align="center" justify="space-between">
          <Text size={2} weight="semibold">
            Firebase Sync
          </Text>
          <Badge
            tone={statusTone}
            padding={2}
            fontSize={1}
            style={{ textTransform: 'capitalize' }}
          >
            {syncStatus.status}
          </Badge>
        </Flex>

        <Grid columns={2} gap={3}>
          <Card padding={3} radius={2} tone="default" shadow={1}>
            <Stack space={1}>
              <Text size={0} muted>
                Pending
              </Text>
              <Text size={3} weight="bold">
                {syncStatus.pendingItems}
              </Text>
            </Stack>
          </Card>
          <Card
            padding={3}
            radius={2}
            tone={syncStatus.failedItems > 0 ? 'critical' : 'default'}
            shadow={1}
          >
            <Stack space={1}>
              <Text size={0} muted>
                Failed
              </Text>
              <Text size={3} weight="bold">
                {syncStatus.failedItems}
              </Text>
            </Stack>
          </Card>
        </Grid>

        {syncStatus.lastSync && (
          <Text size={0} muted>
            Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
