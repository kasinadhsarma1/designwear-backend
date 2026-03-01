import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'supplier',
    title: 'Supplier',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Supplier Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'contactPerson',
            title: 'Contact Person',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email(),
        }),
        defineField({
            name: 'phone',
            title: 'Phone',
            type: 'string',
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'text',
        }),
        defineField({
            name: 'website',
            title: 'Website',
            type: 'url',
        }),
        defineField({
            name: 'notes',
            title: 'Notes',
            type: 'text',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'contactPerson',
        },
    },
})
