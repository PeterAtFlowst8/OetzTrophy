import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Festival Dates & Registration',
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
    defineField({
      name: 'registrationOpensAt',
      title: 'Registration Opens',
      type: 'datetime',
      description:
        'When online registration opens. Before this moment, the homepage and registration page show a "registration opens on …" message and the form is hidden. After it, the form goes live automatically.',
    }),
    defineField({
      name: 'registrationFeeEur',
      title: 'Registration Fee (EUR)',
      type: 'number',
      description:
        'Race-weekend registration fee in euros, e.g. 135. This is BOTH the price shown on the registration page AND the amount charged at checkout. Change it here and both update together.',
      validation: (Rule) => Rule.min(0).precision(2),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Festival Dates & Registration' };
    },
  },
});
