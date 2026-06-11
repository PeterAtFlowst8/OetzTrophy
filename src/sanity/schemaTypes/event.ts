import { defineType, defineField, defineArrayMember } from 'sanity';
import { CalendarIcon } from '@sanity/icons';
import {
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedSlug,
} from './shared';

export const event = defineType({
  name: 'event',
  title: 'Race / Festival Page',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    localizedString(
      'title',
      'Page Title',
      'Shown as the main heading on the public race/festival page.',
    ),
    localizedString(
      'pageLabel',
      'Page Label',
      'The small coloured line above the page title in the header. Leave blank to use the built-in default.',
    ),
    localizedSlug('slug', 'Page URL Slug'),
    defineField({
      name: 'date',
      title: 'Event Date',
      type: 'datetime',
      description: 'Shown in the event facts on the public page.',
    }),
    localizedText(
      'excerpt',
      'Short Fallback Description',
      'Used as a fallback if the full page text is empty.',
    ),
    localizedBlockContent(
      'body',
      'Main Page Text',
      'Main editable text shown below the page header. (For the Kayak Festival page, the day-by-day schedule and location block are edited separately under "Main Website Text & Images" → Kayak Festival Schedule & Location.)',
    ),
    defineField({
      name: 'entryType',
      title: 'Entry / Registration Path',
      type: 'string',
      description:
        'This controls the participation label only. Boater X remains its own race, but paid race participation uses one shared race-weekend registration.',
      options: {
        list: [
          { title: 'Qualification', value: 'qualification' },
          { title: 'Race Weekend Registration', value: 'open' },
          { title: 'Free Festival Access', value: 'free' },
        ],
      },
    }),
    defineField({
      name: 'format',
      title: 'Format Label',
      type: 'string',
      description: 'Shown in the event facts, for example Time Trial, Head-to-Head, or Festival.',
    }),
    defineField({
      name: 'rules',
      title: 'Rules List',
      type: 'array',
      description: 'Optional numbered rules shown underneath the race facts.',
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
  ],
  orderings: [
    {
      title: 'Event date',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title.de', subtitle: 'format' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title,
        subtitle,
      };
    },
  },
});
