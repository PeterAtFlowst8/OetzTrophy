const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

/**
 * Global film-grain texture.
 *
 * Rendered ONCE as a `fixed`, `pointer-events-none` layer (skill §6.E). Because
 * it is fixed and uses no `mix-blend-mode` / `backdrop-filter`, the compositor
 * paints it a single time and simply holds it in place during scroll — zero
 * per-frame repaint. Per-section `absolute` grain with `mix-blend-mode: overlay`
 * was forcing a full repaint of the blended region on every scroll frame, which
 * read as jank even though the main thread stayed at 60fps.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        backgroundImage: GRAIN,
        backgroundSize: '200px 200px',
        opacity: 0.045,
      }}
    />
  );
}
