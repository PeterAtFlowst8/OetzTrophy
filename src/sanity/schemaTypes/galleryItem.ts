import { defineType, defineField } from 'sanity';
import { ImagesIcon } from '@sanity/icons';
import { localizedString } from './shared';

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
      validation: (rule) => rule.required(),
    }),
    localizedString('caption', 'Caption'),
    defineField({ name: 'year', title: 'Year', type: 'number' }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'string',
      options: {
        list: [
          { title: 'Oetz Trophy', value: 'oetz-trophy' },
          { title: 'Boater X', value: 'boater-x' },
          { title: 'Kayak Festival', value: 'kajakfestival' },
        ],
      },
    }),
    defineField({ name: 'photographer', title: 'Photographer', type: 'string' }),
  ],
  preview: {
    select: { title: 'caption.de', subtitle: 'year', media: 'image' },
  },
});
