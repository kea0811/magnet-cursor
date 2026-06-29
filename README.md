# magnet-cursor

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/magnet-cursor.svg)
![npm downloads](https://img.shields.io/npm/dm/magnet-cursor.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/magnet-cursor?label=gzip)

**🌐 [Live demo →](https://magnet-cursor.vercel.app)**

> A custom cursor that magnetically pulls toward your buttons and links — tiny, dependency-free, and built for React 18 & 19.

Drop one `<MagnetCursor />` near the root of your app, tag the things you want to feel
"sticky" with `data-magnetic`, and the cursor glides across the page and snaps onto
them as the pointer approaches. No wrappers, no context, no layout shift — it renders a
single `aria-hidden`, `position: fixed` dot.

## For AI coding agents

Drop [`SKILL.md`](./SKILL.md) into your AI editor / Claude Code workspace and it learns
how to use this library — when to reach for it, the install + canonical pattern, the
public API, and the gotchas that are easy to miss.

## Install

```bash
pnpm add magnet-cursor
```

> _Bleeding edge or before the first npm release: `pnpm add github:kea0811/magnet-cursor`._

<sub>npm and yarn work too: `npm i magnet-cursor` · `yarn add magnet-cursor`.</sub>

## Quick example

```tsx
import { MagnetCursor } from 'magnet-cursor';

export function App() {
  return (
    <>
      {/* One cursor for the whole app. */}
      <MagnetCursor color="#7c5cff" hideNativeCursor />

      {/* Mark anything magnetic. */}
      <button data-magnetic>Get started</button>
      <a data-magnetic href="/docs">Read the docs</a>
    </>
  );
}
```

That's the whole integration. Every element matching the selector (default
`[data-magnetic]`) becomes a magnet; the closest one within `radius` wins.

### Prefer to own the markup? Use the hook

`useMagnetCursor()` is the headless core. It returns the props for your cursor element
plus an `isPulling` flag so you can morph it however you like:

```tsx
import { useMagnetCursor } from 'magnet-cursor';

function Cursor() {
  const { cursorProps, isPulling } = useMagnetCursor({ strength: 0.6, radius: 120 });
  return <div {...cursorProps} className={isPulling ? 'cursor cursor--locked' : 'cursor'} />;
}
```

The pointer position is written to the `--mc-x` / `--mc-y` CSS variables directly on the
node, so the cursor tracks the mouse without a React re-render on every pixel — only the
hover/morph state flips React state.

## API

### `<MagnetCursor />`

Accepts every option below, plus `className` and `style` to restyle the dot.

### `useMagnetCursor(options)`

Returns `{ cursorProps, isPulling, isActive, isVisible }`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `'[data-magnetic]'` | CSS selector for magnetic targets. |
| `radius` | `number` | `90` | Pull activation distance from an element's edge, in px. |
| `strength` | `number` | `0.5` | Pull amount, `0` (none) → `1` (snap to center). Weighted by proximity. |
| `size` | `number` | `26` | Cursor diameter, in px. |
| `color` | `string` | `rgba(124,92,255,.65)` | Any CSS color. |
| `pullScale` | `number` | `2.2` | Cursor scale while locked onto a target. |
| `followDuration` | `number` | `140` | Easing duration for follow/pull motion, in ms. |
| `hideNativeCursor` | `boolean` | `false` | Hide the OS cursor (`cursor: none` on `<body>`) while active. |
| `disabled` | `boolean` | `false` | Turn the effect off entirely. |
| `respectReducedMotion` | `boolean` | `true` | Honor `prefers-reduced-motion: reduce`. |

## Accessibility & motion

- The cursor is `aria-hidden` and `pointer-events: none`, so it never enters the
  accessibility tree or intercepts clicks.
- With `respectReducedMotion` on (the default), the custom cursor disables itself when
  the user prefers reduced motion and the native cursor takes over.
- It's a progressive enhancement — on touch devices with no pointer, the dot simply
  stays hidden and your UI works exactly as before.

## Live demo

Play with every prop live at **[magnet-cursor.vercel.app](https://magnet-cursor.vercel.app)**.

## Contributing

Issues and PRs are welcome. To work on it locally:

```bash
pnpm install
pnpm test         # vitest
pnpm test:coverage
pnpm build        # ESM + CJS + .d.ts
pnpm demo:dev     # run the demo app
```

## License

[MIT](./LICENSE) © 2026 kea0811
