import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'customer',
    title: 'Customer',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Customer Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'addresses',
            title: 'Addresses',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'label', type: 'string', title: 'Label (e.g., Home, Work)' },
                        { name: 'street', type: 'string', title: 'Street' },
                        { name: 'city', type: 'string', title: 'City' },
                        { name: 'state', type: 'string', title: 'State' },
                        { name: 'zipCode', type: 'string', title: 'ZIP Code' },
                        { name: 'country', type: 'string', title: 'Country' },
                        { name: 'isDefault', type: 'boolean', title: 'Default Address' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'totalOrders',
            title: 'Total Orders',
            type: 'number',
            readOnly: true,
            initialValue: 0,
        }),
        defineField({
            name: 'totalSpent',
            title: 'Total Spent',
            type: 'number',
            readOnly: true,
            initialValue: 0,
        }),
        defineField({
            name: 'registeredAt',
            title: 'Registered At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'email',
            orders: 'totalOrders',
        },
        prepare({ title, subtitle, orders }) {
            return {
                title,
                subtitle: `${subtitle} | ${orders} orders`,
            }
        },
    },
})
