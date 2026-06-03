import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'festivalDate',
      title: 'Festival Start Date',
      type: 'datetime',
    }),
    defineField({ name: 'raceDate', title: 'Race Date', type: 'datetime' }),
    defineField({
      name: 'festivalEndDate',
      title: 'Festival End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'registrationOpen',
      title: 'Registration Open',
      type: 'boolean',
    }),
    defineField({
      name: 'registrationDeadline',
      title: 'Registration Deadline',
      type: 'datetime',
    }),
    defineField({
      name: 'registrationFee',
      title: 'Registration Fee (EUR)',
      type: 'number',
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
