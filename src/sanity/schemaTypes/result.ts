import { defineType, defineField, defineArrayMember } from 'sanity';
import { BoltIcon } from '@sanity/icons';

export const result = defineType({
  name: 'result',
  title: 'Race Result',
  type: 'document',
  icon: BoltIcon,
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'string',
      options: {
        list: [
          { title: 'Oetz Trophy', value: 'oetz-trophy' },
          { title: 'Kayak Cross', value: 'boater-x' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Men', value: 'men' },
          { title: 'Women', value: 'women' },
          { title: 'Open', value: 'open' },
        ],
      },
    }),
    defineField({
      name: 'placements',
      title: 'Placements',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'position', title: 'Position', type: 'number' }),
            defineField({ name: 'name', title: 'Athlete Name', type: 'string' }),
            defineField({ name: 'nationality', title: 'Nationality', type: 'string' }),
            defineField({ name: 'time', title: 'Time', type: 'string' }),
            defineField({ name: 'club', title: 'Club', type: 'string' }),
          ],
          preview: {
            select: { position: 'position', name: 'name', nationality: 'nationality' },
            prepare({ position, name, nationality }) {
              return {
                title: `${position ? `${position}. ` : ''}${name || 'Unnamed'}`,
                subtitle: nationality,
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Year, newest first',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
  preview: {
    select: { year: 'year', event: 'event', category: 'category' },
    prepare({ year, event, category }) {
      return {
        title: `${year ?? ''} - ${event ?? ''}`.trim(),
        subtitle: category,
      };
    },
  },
});
