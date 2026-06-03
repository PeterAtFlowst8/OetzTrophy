import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';
import {
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedSlug,
  seoField,
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
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
    }),
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
    seoField,
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title.de', subtitle: 'title.en', media: 'coverImage' },
  },
});
