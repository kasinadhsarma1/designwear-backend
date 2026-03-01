import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Product Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'compareAtPrice',
            title: 'Compare at Price',
            type: 'number',
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: 'stock',
            title: 'Stock Quantity',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
            initialValue: 0,
        }),
        defineField({
            name: 'lowStockThreshold',
            title: 'Low Stock Threshold',
            type: 'number',
            validation: (Rule) => Rule.min(0),
            initialValue: 10,
        }),
        defineField({
            name: 'sku',
            title: 'SKU',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'images',
            title: 'Product Images',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'sizes',
            title: 'Available Sizes',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'XS', value: 'xs' },
                    { title: 'S', value: 's' },
                    { title: 'M', value: 'm' },
                    { title: 'L', value: 'l' },
                    { title: 'XL', value: 'xl' },
                    { title: 'XXL', value: 'xxl' },
                ],
            },
        }),
        defineField({
            name: 'colors',
            title: 'Available Colors',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Active', value: 'active' },
                    { title: 'Draft', value: 'draft' },
                    { title: 'Archived', value: 'archived' },
                ],
            },
            initialValue: 'draft',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'featured',
            title: 'Featured Product',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'supplier',
            title: 'Supplier',
            type: 'reference',
            to: [{ type: 'supplier' }],
        }),
        defineField({
            name: 'dbSyncStatus',
            title: 'Database Sync Status',
            type: 'object',
            fields: [
                { name: 'synced', type: 'boolean', title: 'Synced', initialValue: false },
                { name: 'lastSyncedAt', type: 'datetime', title: 'Last Synced At' },
                { name: 'syncError', type: 'text', title: 'Sync Error' },
            ],
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'sku',
            media: 'images.0',
            stock: 'stock',
            status: 'status',
        },
        prepare({ title, subtitle, media, stock, status }) {
            return {
                title,
                subtitle: `${subtitle} | Stock: ${stock} | ${status}`,
                media,
            }
        },
    },
})
