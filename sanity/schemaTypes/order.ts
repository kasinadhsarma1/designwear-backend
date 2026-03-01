import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'order',
    title: 'Order',
    type: 'document',
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'customer',
            title: 'Customer',
            type: 'reference',
            to: [{ type: 'customer' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'items',
            title: 'Order Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'product',
                            title: 'Product',
                            type: 'reference',
                            to: [{ type: 'product' }],
                        },
                        { name: 'quantity', title: 'Quantity', type: 'number' },
                        { name: 'size', title: 'Size', type: 'string' },
                        { name: 'color', title: 'Color', type: 'string' },
                        { name: 'price', title: 'Price at Purchase', type: 'number' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'totalAmount',
            title: 'Total Amount',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Processing', value: 'processing' },
                    { title: 'Shipped', value: 'shipped' },
                    { title: 'Delivered', value: 'delivered' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'paymentStatus',
            title: 'Payment Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Paid', value: 'paid' },
                    { title: 'Failed', value: 'failed' },
                    { title: 'Refunded', value: 'refunded' },
                ],
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'object',
            fields: [
                { name: 'street', type: 'string', title: 'Street' },
                { name: 'city', type: 'string', title: 'City' },
                { name: 'state', type: 'string', title: 'State' },
                { name: 'zipCode', type: 'string', title: 'ZIP Code' },
                { name: 'country', type: 'string', title: 'Country' },
            ],
        }),
        defineField({
            name: 'orderDate',
            title: 'Order Date',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'notes',
            title: 'Order Notes',
            type: 'text',
        }),
    ],
    preview: {
        select: {
            title: 'orderNumber',
            customer: 'customer.name',
            total: 'totalAmount',
            status: 'status',
        },
        prepare({ title, customer, total, status }) {
            return {
                title: `Order ${title}`,
                subtitle: `${customer} | ₹${total} | ${status}`,
            }
        },
    },
})
