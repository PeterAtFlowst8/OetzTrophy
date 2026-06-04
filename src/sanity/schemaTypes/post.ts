import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';
import {
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedSlug,
} from './shared';

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    localizedString('title', 'Title'),
    localizedSlug('slug'),
    localizedText('excerpt', 'Excerpt'),
    localizedBlockContent('body', 'Body'),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'News', value: 'news' },
          { title: 'Results', value: 'results' },
          { title: 'Press', value: 'press' },
        ],
      },
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title.de', subtitle: 'publishedAt' },
  },
});
