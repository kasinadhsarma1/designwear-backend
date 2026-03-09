import React from 'react'
import { useFormValue } from 'sanity'
import { Stack, Text, Card } from '@sanity/ui'

export function PriceWithTaxInput() {
    const price = useFormValue(['price']) as number | undefined
    const taxRate = useFormValue(['taxRate']) as number | undefined

    const p = price || 0
    const t = taxRate !== undefined ? taxRate : 18
    const total = p + (p * t / 100)

    return (
        <Card padding={3} radius={2} shadow={1} tone="primary">
            <Stack space={3}>
                <Text size={1} weight="semibold" muted>
                    Calculated Price (Including {t}% Tax)
                </Text>
                <Text size={3} weight="bold">
                    ${total.toFixed(2)}
                </Text>
            </Stack>
        </Card>
    )
}
