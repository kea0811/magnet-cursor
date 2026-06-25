import type { CSSProperties } from 'react';
import { useMagnetCursor } from './useMagnetCursor';
import type { UseMagnetCursorOptions } from './types';

/**
 * Props for {@link MagnetCursor}. Combines the cursor options with an optional
 * `className` and `style` so you can restyle the dot however you like.
 */
export interface MagnetCursorProps extends UseMagnetCursorOptions {
  className?: string;
  style?: CSSProperties;
}

/**
 * A ready-made magnetic cursor. Drop ONE of these near the root of your app and
 * mark any clickable element with `data-magnetic` — the cursor will glide
 * across the page and snap onto those elements as the pointer approaches.
 *
 * It renders a single `aria-hidden`, `position: fixed` dot, so it never affects
 * layout or the accessibility tree.
 *
 * @example
 * ```tsx
 * <>
 *   <MagnetCursor color="#7c5cff" hideNativeCursor />
 *   <button data-magnetic>Hover near me</button>
 * </>
 * ```
 */
export function MagnetCursor({ className, style, ...options }: MagnetCursorProps) {
  const { cursorProps, isPulling } = useMagnetCursor(options);

  return (
    <div
      {...cursorProps}
      data-pulling={isPulling}
      className={['magnet-cursor', isPulling ? 'magnet-cursor--pulling' : null, className]
        .filter(Boolean)
        .join(' ')}
      style={{ ...cursorProps.style, ...style }}
    />
  );
}
