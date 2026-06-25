import type { CSSProperties, RefCallback } from 'react';

/**
 * Options that control the magnetic cursor.
 *
 * Every field is optional — sensible defaults are applied so `useMagnetCursor()`
 * and `<MagnetCursor />` work with zero configuration.
 */
export interface UseMagnetCursorOptions {
  /**
   * CSS selector for the elements the cursor should be drawn toward. Mark any
   * element with the matching attribute/class and it becomes magnetic.
   * @default '[data-magnetic]'
   */
  selector?: string;
  /**
   * How close (in pixels, measured from an element's edge) the pointer must be
   * before the cursor starts getting pulled in.
   * @default 90
   */
  radius?: number;
  /**
   * Pull strength from `0` (no pull) to `1` (snaps straight to the element's
   * center). The effect is also weighted by proximity, so the closer you get,
   * the stronger the tug.
   * @default 0.5
   */
  strength?: number;
  /**
   * Cursor diameter, in pixels.
   * @default 26
   */
  size?: number;
  /**
   * Cursor color. Any CSS color works — `hsl`, `rgb`, `var(--token)`, etc.
   * @default 'rgba(124, 92, 255, 0.65)'
   */
  color?: string;
  /**
   * Scale applied to the cursor while it is locked onto a magnetic element,
   * giving it a "swallow the button" morph.
   * @default 2.2
   */
  pullScale?: number;
  /**
   * Easing duration for the follow/pull motion, in milliseconds.
   * @default 140
   */
  followDuration?: number;
  /**
   * Hide the operating-system cursor (`cursor: none` on `<body>`) while the
   * magnetic cursor is active. Restored automatically on unmount.
   * @default false
   */
  hideNativeCursor?: boolean;
  /**
   * Disable the effect entirely. The cursor element renders but stays invisible
   * and no pointer listeners are attached.
   * @default false
   */
  disabled?: boolean;
  /**
   * When `true`, honor `prefers-reduced-motion: reduce` by switching the custom
   * cursor off and letting the native cursor take over.
   * @default true
   */
  respectReducedMotion?: boolean;
}

/**
 * Props to spread onto the `aria-hidden` cursor element.
 */
export interface MagnetCursorVisualProps {
  ref: RefCallback<HTMLDivElement>;
  'aria-hidden': true;
  style: CSSProperties;
}

/**
 * Return value of {@link useMagnetCursor}.
 */
export interface UseMagnetCursorResult {
  /** Spread onto the single, fixed-position cursor element you render. */
  cursorProps: MagnetCursorVisualProps;
  /** `true` while the cursor is locked onto a magnetic element. */
  isPulling: boolean;
  /** `true` when the custom cursor is enabled (not disabled / reduced-motion). */
  isActive: boolean;
  /** `true` once the pointer has moved inside the document. */
  isVisible: boolean;
}
