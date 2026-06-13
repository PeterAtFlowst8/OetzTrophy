import TextWithLinks from '@/components/TextWithLinks';

/**
 * Centred "coming soon" section shared by the Results and Gallery pages: a small
 * accent eyebrow above a paragraph of editable body copy. The body runs through
 * <TextWithLinks/> so a Studio link written as `[text](url)` renders as a real
 * anchor.
 */
type Props = { eyebrow: string; body: string };

export default function ComingSoonSection({ eyebrow, body }: Props) {
  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <div>
          <p
            className="uppercase mb-6"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'var(--color-accent)',
            }}
          >
            {eyebrow}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--color-body-text)',
            }}
          >
            <TextWithLinks text={body} />
          </p>
        </div>
      </div>
    </section>
  );
}
