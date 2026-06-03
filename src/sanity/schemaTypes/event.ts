import { defineType, defineField, defineArrayMember } from 'sanity';
import { CalendarIcon } from '@sanity/icons';
import {
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedSlug,
  seoField,
} from './shared';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    localizedString('title', 'Title'),
    localizedSlug('slug'),
    defineField({ name: 'date', title: 'Event Date', type: 'datetime' }),
    localizedText('excerpt', 'Short Description'),
    localizedBlockContent('body', 'Full Description'),
    defineField({
      name: 'entryType',
      title: 'Entry Type',
      type: 'string',
      options: {
        list: [
          { title: 'Qualification', value: 'qualification' },
          { title: 'Open Entry', value: 'open' },
          { title: 'Free', value: 'free' },
        ],
      },
    }),
    defineField({ name: 'format', title: 'Race Format', type: 'string' }),
    defineField({
      name: 'rules',
      title: 'Rules',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'de', title: '🇩🇪 Deutsch', type: 'text', rows: 2 }),
            defineField({ name: 'en', title: '🇬🇧 English', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'de', subtitle: 'en' } },
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
    }),
    seoField,
  ],
  orderings: [
    {
      title: 'Event date',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title.de', subtitle: 'title.en', media: 'image' },
  },
});
