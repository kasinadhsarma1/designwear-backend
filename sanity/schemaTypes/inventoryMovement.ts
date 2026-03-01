import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'inventoryMovement',
    title: 'Inventory Movement',
    type: 'document',
    fields: [
        defineField({
            name: 'product',
            title: 'Product',
            type: 'reference',
            to: [{ type: 'product' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'type',
            title: 'Movement Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Stock In', value: 'in' },
                    { title: 'Stock Out', value: 'out' },
                    { title: 'Adjustment', value: 'adjustment' },
                    { title: 'Return', value: 'return' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'quantity',
            title: 'Quantity',
            type: 'number',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'reason',
            title: 'Reason',
            type: 'string',
            options: {
                list: [
                    { title: 'Purchase', value: 'purchase' },
                    { title: 'Sale', value: 'sale' },
                    { title: 'Damage', value: 'damage' },
                    { title: 'Lost', value: 'lost' },
                    { title: 'Return', value: 'return' },
                    { title: 'Manual Adjustment', value: 'manual' },
                ],
            },
        }),
        defineField({
            name: 'reference',
            title: 'Reference (Order/PO Number)',
            type: 'string',
        }),
        defineField({
            name: 'notes',
            title: 'Notes',
            type: 'text',
        }),
        defineField({
            name: 'performedBy',
            title: 'Performed By',
            type: 'string',
        }),
        defineField({
            name: 'timestamp',
            title: 'Timestamp',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            product: 'product.name',
            type: 'type',
            quantity: 'quantity',
            timestamp: 'timestamp',
        },
        prepare({ product, type, quantity, timestamp }) {
            return {
                title: `${product}`,
                subtitle: `${type} | ${quantity} units | ${new Date(timestamp).toLocaleDateString()}`,
            }
        },
    },
})
