import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'systemLog',
    title: 'System Log',
    type: 'document',
    fields: [
        defineField({
            name: 'level',
            title: 'Log Level',
            type: 'string',
            options: {
                list: [
                    { title: 'Info', value: 'info' },
                    { title: 'Warning', value: 'warning' },
                    { title: 'Error', value: 'error' },
                    { title: 'Critical', value: 'critical' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Database Sync', value: 'db_sync' },
                    { title: 'API Request', value: 'api' },
                    { title: 'Authentication', value: 'auth' },
                    { title: 'System', value: 'system' },
                ],
            },
        }),
        defineField({
            name: 'message',
            title: 'Message',
            type: 'text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'details',
            title: 'Details',
            type: 'object',
            fields: [
                { name: 'error', type: 'text', title: 'Error Details' },
                { name: 'stack', type: 'text', title: 'Stack Trace' },
                { name: 'metadata', type: 'text', title: 'Additional Metadata (JSON)' },
            ],
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
            level: 'level',
            message: 'message',
            timestamp: 'timestamp',
        },
        prepare({ level, message, timestamp }) {
            return {
                title: `[${level.toUpperCase()}] ${message}`,
                subtitle: new Date(timestamp).toLocaleString(),
            }
        },
    },
})
