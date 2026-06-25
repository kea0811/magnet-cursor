---
name: magnet-cursor
description: Use when the user wants a custom cursor that magnetically pulls/snaps toward buttons, links, or other elements in a React app — a "magnetic cursor" interaction. React 18 or 19, dependency-free, client-side only (needs a real pointer/DOM).
---

# magnet-cursor

A tiny React library for a custom cursor that eases toward elements marked `data-magnetic`
and "swallows" the closest one as the pointer approaches. Reach for it when a user wants
the award-site magnetic-cursor effect without hand-rolling pointer math, CSS variables, and
reduced-motion handling. Ships a batteries-included `<MagnetCursor />` component and a
headless `useMagnetCursor()` hook. Works under React 18 and 19, including StrictMode.

## When to reach for this

User says:
- "I want a custom cursor that snaps to my buttons"
- "Add a magnetic cursor / sticky cursor effect"
- "Make the cursor get pulled toward links when I hover near them"

User does NOT mean this when they ask for:
- ❌ Magnetic *buttons* that themselves move toward the mouse — this moves the cursor, not the element. (Roll a small transform-on-pointermove handler instead.)
- ❌ A cursor *trail* / particle follower (different effect — use a trail library).
- ❌ Replacing the cursor with a custom *image* only (just CSS `cursor: url(...)`).

## Install

```bash
pnpm add magnet-cursor
```

## Most common pattern (95% of cases)

```tsx
import { MagnetCursor } from 'magnet-cursor';

export function App() {
  return (
    <>
      <MagnetCursor color="#7c5cff" hideNativeCursor />
      <button data-magnetic>Get started</button>
      <a data-magnetic href="/docs">Docs</a>
    </>
  );
}
```

Render exactly one `<MagnetCursor />` for the whole app, then add `data-magnetic` to any
element you want to be sticky. Need full control of the markup? Use the hook:

```tsx
import { useMagnetCursor } from 'magnet-cursor';

const { cursorProps, isPulling } = useMagnetCursor({ strength: 0.6 });
return <div {...cursorProps} className={isPulling ? 'locked' : ''} />;
```

## API / props

Both `<MagnetCursor />` and `useMagnetCursor(options)` take the same options:

| Option | Default | What it does |
| --- | --- | --- |
| `selector` | `'[data-magnetic]'` | CSS selector for magnetic targets |
| `radius` | `90` | Pull activation distance from an element's edge (px) |
| `strength` | `0.5` | Pull amount, `0`–`1` (`1` = snap to center), weighted by proximity |
| `size` | `26` | Cursor diameter (px) |
| `color` | `rgba(124,92,255,.65)` | Any CSS color |
| `pullScale` | `2.2` | Cursor scale while locked onto a target |
| `followDuration` | `140` | Follow/pull easing duration (ms) |
| `hideNativeCursor` | `false` | Hide the OS cursor while active |
| `disabled` | `false` | Turn the effect off |
| `respectReducedMotion` | `true` | Honor `prefers-reduced-motion` |

`useMagnetCursor` returns `{ cursorProps, isPulling, isActive, isVisible }`. Spread
`cursorProps` onto your single fixed-position element.

## Gotchas worth knowing

1. Render only **one** cursor instance — it listens on `document` and tracks the whole page; multiple instances stack visible dots.
2. It's pointer-driven and client-only: on touch devices (no pointer) and under `prefers-reduced-motion`, the custom cursor stays hidden by design and the native cursor/UX is untouched. Don't rely on it for anything functional.
3. `radius` is measured from the element's **edge**, not its center, so large buttons get a generous, size-aware pull zone automatically.
4. The cursor is `position: fixed` with a very high `z-index` and `pointer-events: none` — it floats above everything and never blocks clicks, but if you have your own `z-index` battles, that's where it sits.

## Links

- npm / install: https://www.npmjs.com/package/magnet-cursor
- demo / landing: https://magnet-cursor.vercel.app
- repo: https://github.com/kea0811/magnet-cursor
