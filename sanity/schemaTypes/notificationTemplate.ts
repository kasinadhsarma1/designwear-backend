import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'notificationTemplate',
    title: 'Notification Template',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Internal Name',
            type: 'string',
            description: 'For internal reference, e.g., "Order Received"',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'eventType',
            title: 'Event Type Identifier',
            type: 'string',
            description: 'The programmatic identifier used by the backend wrapper, e.g., "order.created"',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Notification Title',
            type: 'string',
            description: 'The headline of the push notification. Supports variables like {{orderId}}',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'body',
            title: 'Notification Body',
            type: 'text',
            description: 'The main message of the push notification. Supports variables like {{customerName}}',
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'eventType',
        },
    },
})
