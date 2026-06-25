import { useState } from 'react';
import { MagnetCursor } from 'magnet-cursor';

const INSTALL = 'pnpm add magnet-cursor';

const COMPONENT_SNIPPET = `import { MagnetCursor } from 'magnet-cursor';

export function App() {
  return (
    <>
      <MagnetCursor color="#7c5cff" hideNativeCursor />

      {/* Mark anything magnetic — buttons, links, cards… */}
      <button data-magnetic>Get started</button>
      <a data-magnetic href="/docs">Docs</a>
    </>
  );
}`;

const HOOK_SNIPPET = `import { useMagnetCursor } from 'magnet-cursor';

export function Cursor() {
  // Headless: you own the element and the styling.
  const { cursorProps, isPulling } = useMagnetCursor({ strength: 0.6 });
  return <div {...cursorProps} className={isPulling ? 'big' : ''} />;
}`;

const TILES = [
  { label: 'Buttons', glyph: '◉' },
  { label: 'Links', glyph: '↗' },
  { label: 'Cards', glyph: '▢' },
  { label: 'Avatars', glyph: '☺' },
  { label: 'Icons', glyph: '✦' },
  { label: 'Chips', glyph: '◗' },
  { label: 'Tabs', glyph: '⊟' },
  { label: 'Pills', glyph: '⬭' },
];

const FEATURES = [
  {
    title: 'Snaps to anything',
    body: 'Add data-magnetic to any element and the cursor eases toward its center as you approach. Buttons, links, cards, avatars — all fair game.',
  },
  {
    title: 'Respects reduced motion',
    body: 'When prefers-reduced-motion: reduce is set, the custom cursor switches itself off and hands control straight back to the native cursor.',
  },
  {
    title: 'Headless hook included',
    body: 'Want full control of the markup and styling? useMagnetCursor() hands you the props and the isPulling flag — render whatever you like.',
  },
  {
    title: 'Zero dependencies',
    body: 'One ~1.5 kB hook, no runtime deps. Position is written to CSS variables, so the cursor tracks without a React re-render on every pixel.',
  },
];

const API = [
  ['selector', "'[data-magnetic]'", 'CSS selector for magnetic targets.'],
  ['radius', '90', 'Pull activation distance from an element edge, in px.'],
  ['strength', '0.5', 'Pull amount, 0 (none) → 1 (snap to center).'],
  ['size', '26', 'Cursor diameter in px.'],
  ['color', 'rgba(124,92,255,.65)', 'Any CSS color.'],
  ['pullScale', '2.2', 'Cursor scale while locked onto a target.'],
  ['followDuration', '140', 'Easing duration for follow/pull, in ms.'],
  ['hideNativeCursor', 'false', 'Hide the OS cursor while active.'],
  ['disabled', 'false', 'Turn the effect off entirely.'],
  ['respectReducedMotion', 'true', 'Honor prefers-reduced-motion.'],
];

export function App() {
  const [strength, setStrength] = useState(0.6);
  const [radius, setRadius] = useState(120);
  const [size, setSize] = useState(28);
  const [pullScale, setPullScale] = useState(2.4);
  const [color, setColor] = useState('#7c5cff');
  const [hideNative, setHideNative] = useState(true);

  return (
    <div className="page">
      <MagnetCursor
        className="demo-cursor"
        strength={strength}
        radius={radius}
        size={size}
        pullScale={pullScale}
        color={color}
        hideNativeCursor={hideNative}
      />

      <header className="hero">
        <span className="eyebrow">React 18 &amp; 19 · zero deps · ~1.5&nbsp;kB</span>
        <h1 className="title">magnet-cursor</h1>
        <p className="tagline">
          A custom cursor that <strong>magnetically pulls</strong> toward your buttons
          and links. Drop one component in, sprinkle <code>data-magnetic</code>, done.
        </p>

        <div className="install">
          <code className="install-code">{INSTALL}</code>
        </div>

        <div className="hero-cta">
          <button className="btn btn-primary" data-magnetic>
            Move your mouse →
          </button>
          <a
            className="btn btn-ghost"
            data-magnetic
            href="https://github.com/kea0811/magnet-cursor"
          >
            View source
          </a>
        </div>
        <p className="hint">
          This entire page is wired up — drift the pointer near anything and watch it
          get caught. <span className="hint-dim">(best with a mouse or trackpad)</span>
        </p>
      </header>

      <main>
        <section className="section">
          <h2 className="section-title">Everything here is magnetic</h2>
          <p className="section-sub">
            Each tile carries a single <code>data-magnetic</code> attribute. Sweep
            across them — the cursor locks onto whichever is closest and swells to
            swallow it.
          </p>
          <div className="grid">
            {TILES.map((tile) => (
              <button className="tile" data-magnetic key={tile.label}>
                <span className="tile-glyph" aria-hidden>
                  {tile.glyph}
                </span>
                <span className="tile-label">{tile.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Tune the pull, live</h2>
          <p className="section-sub">
            Every slider maps to one prop. Nudge them and feel the cursor change as you
            move it back over the tiles above.
          </p>

          <div className="controls">
            <div className="control">
              <label className="control-label" htmlFor="strength">
                strength <span className="control-value">{strength.toFixed(2)}</span>
              </label>
              <input
                id="strength"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label className="control-label" htmlFor="radius">
                radius <span className="control-value">{radius}px</span>
              </label>
              <input
                id="radius"
                type="range"
                min={20}
                max={240}
                step={5}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label className="control-label" htmlFor="size">
                size <span className="control-value">{size}px</span>
              </label>
              <input
                id="size"
                type="range"
                min={10}
                max={64}
                step={1}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label className="control-label" htmlFor="pullScale">
                pullScale <span className="control-value">{pullScale.toFixed(1)}×</span>
              </label>
              <input
                id="pullScale"
                type="range"
                min={1}
                max={4}
                step={0.1}
                value={pullScale}
                onChange={(e) => setPullScale(Number(e.target.value))}
              />
            </div>

            <div className="control control-inline">
              <label className="control-label" htmlFor="color">
                color
              </label>
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="control control-inline">
              <label className="control-label" htmlFor="hideNative">
                hideNativeCursor
              </label>
              <input
                id="hideNative"
                type="checkbox"
                checked={hideNative}
                onChange={(e) => setHideNative(e.target.checked)}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Why you might like it</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article className="feature" key={f.title} data-magnetic>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">The 5-second integration</h2>
          <p className="section-sub">
            Use the batteries-included component, or go headless with the hook.
          </p>
          <div className="code-grid">
            <div className="code-card">
              <span className="code-tag">Component</span>
              <pre className="code">
                <code>{COMPONENT_SNIPPET}</code>
              </pre>
            </div>
            <div className="code-card">
              <span className="code-tag">Hook</span>
              <pre className="code">
                <code>{HOOK_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">API at a glance</h2>
          <div className="api">
            <div className="api-row api-head">
              <span className="api-prop">prop</span>
              <span className="api-default">default</span>
              <span className="api-desc">what it does</span>
            </div>
            {API.map(([prop, def, desc]) => (
              <div className="api-row" key={prop}>
                <span className="api-prop">{prop}</span>
                <span className="api-default">{def}</span>
                <span className="api-desc">{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-text">
          Built with React. MIT licensed. Move your mouse one more time before you go.
        </p>
        <div className="footer-links">
          <a className="footer-link" data-magnetic href="https://github.com/kea0811/magnet-cursor">
            GitHub
          </a>
          <a className="footer-link" data-magnetic href="https://www.npmjs.com/package/magnet-cursor">
            npm
          </a>
        </div>
      </footer>
    </div>
  );
}
