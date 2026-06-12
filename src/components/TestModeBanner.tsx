type Props = { title: string; body: string };

/** High-contrast staging banner. Rendered ONLY when the server decided
 *  isRegistrationTestMode() — never on production deployments. */
export default function TestModeBanner({ title, body }: Props) {
  return (
    <div
      role="status"
      className="px-5 py-4 mb-8"
      style={{
        backgroundColor: '#7c2d12',
        border: '2px dashed #fdba74',
        color: '#ffedd5',
        fontFamily: 'var(--font-body)',
      }}
    >
      <p
        className="uppercase mb-1"
        style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}
      >
        {title}
      </p>
      <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
