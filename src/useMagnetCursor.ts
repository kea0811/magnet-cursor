import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, RefCallback } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import type { UseMagnetCursorOptions, UseMagnetCursorResult } from './types';

export const DEFAULT_SELECTOR = '[data-magnetic]';
export const DEFAULT_RADIUS = 90;
export const DEFAULT_STRENGTH = 0.5;
export const DEFAULT_SIZE = 26;
export const DEFAULT_COLOR = 'rgba(124, 92, 255, 0.65)';
export const DEFAULT_PULL_SCALE = 2.2;
export const DEFAULT_FOLLOW_DURATION = 140;

interface Pull {
  /** Center x of the magnetic element. */
  cx: number;
  /** Center y of the magnetic element. */
  cy: number;
  /** Distance from the pointer to the element's nearest edge. */
  dist: number;
}

/**
 * Headless magnetic cursor.
 *
 * Render a single fixed-position element and spread `cursorProps` onto it.
 * The hook attaches one `pointermove` listener to the document; on every move
 * it finds the closest magnetic element (anything matching `selector`, default
 * `[data-magnetic]`) within `radius` and eases the cursor toward that element's
 * center. The resolved position is written to the `--mc-x` / `--mc-y` custom
 * properties on the DOM node, so the cursor tracks without a React re-render on
 * every pixel — only the hover/morph state flips React state.
 *
 * @example
 * ```tsx
 * const { cursorProps } = useMagnetCursor({ strength: 0.6 });
 * return <div {...cursorProps} />;
 * // ...and mark targets elsewhere: <button data-magnetic>Click</button>
 * ```
 */
export function useMagnetCursor(options: UseMagnetCursorOptions = {}): UseMagnetCursorResult {
  const {
    selector = DEFAULT_SELECTOR,
    radius = DEFAULT_RADIUS,
    strength = DEFAULT_STRENGTH,
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
    pullScale = DEFAULT_PULL_SCALE,
    followDuration = DEFAULT_FOLLOW_DURATION,
    hideNativeCursor = false,
    disabled = false,
    respectReducedMotion = true,
  } = options;

  const prefersReducedMotion = usePrefersReducedMotion();
  const isActive = !disabled && !(respectReducedMotion && prefersReducedMotion);

  // Track the node in state (not a ref) so the observer effect re-runs when the
  // element attaches — the StrictMode-safe pattern.
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const ref = useCallback<RefCallback<HTMLDivElement>>((n) => setNode(n), []);

  const [isPulling, setIsPulling] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node || !isActive) return;

    const findPull = (clientX: number, clientY: number): Pull | null => {
      let best: Pull | null = null;
      document.querySelectorAll<HTMLElement>(selector).forEach((target) => {
        const rect = target.getBoundingClientRect();
        // Distance from the pointer to the element's box (0 while inside it).
        const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
        const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);
        if (dist < radius && (best === null || dist < best.dist)) {
          best = {
            cx: rect.left + rect.width / 2,
            cy: rect.top + rect.height / 2,
            dist,
          };
        }
      });
      return best;
    };

    const handleMove = (event: PointerEvent) => {
      const pull = findPull(event.clientX, event.clientY);
      let x = event.clientX;
      let y = event.clientY;
      if (pull) {
        const factor = strength * (1 - pull.dist / radius);
        x += (pull.cx - event.clientX) * factor;
        y += (pull.cy - event.clientY) * factor;
        setIsPulling(true);
      } else {
        setIsPulling(false);
      }
      node.style.setProperty('--mc-x', `${x}px`);
      node.style.setProperty('--mc-y', `${y}px`);
      setIsVisible(true);
    };

    const handleLeave = () => setIsVisible(false);

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [node, isActive, selector, radius, strength]);

  useEffect(() => {
    if (!isActive || !hideNativeCursor) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = previous;
    };
  }, [isActive, hideNativeCursor]);

  const cursorStyle: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: 'var(--mc-size)',
    height: 'var(--mc-size)',
    borderRadius: '50%',
    background: 'var(--mc-color)',
    pointerEvents: 'none',
    zIndex: 2147483647,
    willChange: 'transform, opacity',
    transform:
      'translate3d(var(--mc-x, -100px), var(--mc-y, -100px), 0) translate(-50%, -50%) scale(var(--mc-scale, 1))',
    transition: 'transform var(--mc-follow, 140ms) ease, opacity 200ms ease',
    opacity: isActive && isVisible ? 1 : 0,
    ['--mc-size' as string]: `${size}px`,
    ['--mc-color' as string]: color,
    ['--mc-follow' as string]: `${followDuration}ms`,
    ['--mc-scale' as string]: isPulling ? String(pullScale) : '1',
  };

  return {
    cursorProps: { ref, 'aria-hidden': true, style: cursorStyle },
    isPulling,
    isActive,
    isVisible,
  };
}
