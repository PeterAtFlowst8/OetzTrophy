import { defineType, defineField } from 'sanity';
import { StarIcon } from '@sanity/icons';

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Sponsor name used for accessibility and in Studio previews.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Show on website',
      description: 'Turn this off to keep the sponsor in Sanity without showing it in the footer.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'Upload a clear logo with transparent or light background where possible.',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      description: 'Required for the footer logo link. Use the full address, starting with https:// or http://.',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'tier',
      title: 'Footer logo priority',
      description: 'Main partners appear larger. Standard and supporting sponsors use the compact footer grid.',
      type: 'string',
      initialValue: 'silver',
      options: {
        layout: 'radio',
        list: [
          { title: 'Main partner (large logo)', value: 'gold' },
          { title: 'Standard sponsor', value: 'silver' },
          { title: 'Supporting sponsor', value: 'bronze' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower numbers appear first. Use gaps like 10, 20, 30 so new sponsors can be inserted later.',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'tier', media: 'logo' },
  },
});
