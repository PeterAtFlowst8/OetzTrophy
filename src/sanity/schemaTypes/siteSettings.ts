import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Festival Dates',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'festivalDate',
      title: 'Festival Start Date',
      type: 'datetime',
      description: 'First public day of the festival. Used by the homepage countdown and calendar download.',
    }),
    defineField({
      name: 'festivalEndDate',
      title: 'Festival End Date',
      type: 'datetime',
      description: 'Final day of the festival. Used by the calendar download.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Festival Dates' };
    },
  },
});
