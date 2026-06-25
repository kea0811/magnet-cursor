import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import {
  useMagnetCursor,
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_PULL_SCALE,
} from './useMagnetCursor';
import type { UseMagnetCursorOptions } from './types';

function Harness(props: UseMagnetCursorOptions) {
  const { cursorProps, isPulling, isActive, isVisible } = useMagnetCursor(props);
  return (
    <div>
      <div
        data-testid="cursor"
        data-pulling={String(isPulling)}
        data-active={String(isActive)}
        data-visible={String(isVisible)}
        {...cursorProps}
      />
      <button data-testid="a" data-magnetic>
        A
      </button>
      <button data-testid="b" data-magnetic>
        B
      </button>
      <button data-testid="c" data-magnetic>
        C
      </button>
    </div>
  );
}

function NoArgsProbe() {
  const { cursorProps } = useMagnetCursor();
  return <div data-testid="noargs" {...cursorProps} />;
}

// jsdom's PointerEvent drops clientX/clientY; a MouseEvent dispatched under the
// `pointermove` type carries the coordinates and the native listener fires.
function move(clientX: number, clientY: number) {
  act(() => {
    document.dispatchEvent(
      new MouseEvent('pointermove', { clientX, clientY, bubbles: true }),
    );
  });
}

function leaveDocument() {
  act(() => {
    document.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  });
}

// jsdom returns an all-zero rect; give a target a controllable box.
function mockBox(
  testId: string,
  box: { left: number; top: number; width: number; height: number },
) {
  const el = screen.getByTestId(testId);
  const rect = {
    left: box.left,
    top: box.top,
    right: box.left + box.width,
    bottom: box.top + box.height,
    width: box.width,
    height: box.height,
    x: box.left,
    y: box.top,
    toJSON: () => ({}),
  } as DOMRect;
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect);
}

// Collapse a target to a single point so edge-distance == distance-to-point.
function mockPoint(testId: string, x: number, y: number) {
  mockBox(testId, { left: x, top: y, width: 0, height: 0 });
}

function setReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
}

const cssVar = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

describe('useMagnetCursor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.cursor = '';
  });

  it('works when called with no arguments at all', () => {
    render(<NoArgsProbe />);
    const cursor = screen.getByTestId('noargs');
    expect(cursor).toHaveAttribute('aria-hidden');
    expect(cssVar(cursor, '--mc-size')).toBe(`${DEFAULT_SIZE}px`);
    expect(cssVar(cursor, '--mc-color')).toBe(DEFAULT_COLOR);
  });

  it('exposes defaults and stays invisible until the pointer moves', () => {
    render(<Harness />);
    const cursor = screen.getByTestId('cursor');

    expect(cursor).toHaveStyle({ position: 'fixed' });
    expect(cssVar(cursor, '--mc-size')).toBe('26px');
    expect(cssVar(cursor, '--mc-follow')).toBe('140ms');
    expect(cssVar(cursor, '--mc-scale')).toBe('1');
    expect(cursor.style.opacity).toBe('0');
    expect(cursor).toHaveAttribute('data-active', 'true');
    expect(cursor).toHaveAttribute('data-visible', 'false');
    expect(cursor).toHaveAttribute('data-pulling', 'false');
  });

  it('honors custom size, color, and follow duration', () => {
    render(<Harness size={40} color="#ff0066" followDuration={300} />);
    const cursor = screen.getByTestId('cursor');
    expect(cssVar(cursor, '--mc-size')).toBe('40px');
    expect(cssVar(cursor, '--mc-color')).toBe('#ff0066');
    expect(cssVar(cursor, '--mc-follow')).toBe('300ms');
  });

  it('follows the raw pointer when no magnetic target is in range', () => {
    render(<Harness radius={80} strength={0.5} />);
    const cursor = screen.getByTestId('cursor');
    mockPoint('a', 1000, 1000);
    mockPoint('b', 1000, 1000);
    mockPoint('c', 1000, 1000);

    move(400, 250);

    expect(cssVar(cursor, '--mc-x')).toBe('400px');
    expect(cssVar(cursor, '--mc-y')).toBe('250px');
    expect(cursor).toHaveAttribute('data-pulling', 'false');
    expect(cursor).toHaveAttribute('data-visible', 'true');
    expect(cursor.style.opacity).toBe('1');
    expect(cssVar(cursor, '--mc-scale')).toBe('1');
  });

  it('pulls toward an element and morphs when in range', () => {
    render(<Harness radius={80} strength={0.5} pullScale={2.2} />);
    const cursor = screen.getByTestId('cursor');
    // Box center (140, 120); pointer 40px to the right of the box edge.
    mockBox('a', { left: 100, top: 100, width: 80, height: 40 });
    mockPoint('b', 5000, 5000);
    mockPoint('c', 5000, 5000);

    move(220, 120);

    // factor = 0.5 * (1 - 40/80) = 0.25 -> x = 220 + (140-220)*0.25 = 200
    expect(cssVar(cursor, '--mc-x')).toBe('200px');
    expect(cssVar(cursor, '--mc-y')).toBe('120px');
    expect(cursor).toHaveAttribute('data-pulling', 'true');
    expect(cssVar(cursor, '--mc-scale')).toBe(String(DEFAULT_PULL_SCALE));
  });

  it('snaps toward center when the pointer is inside the element', () => {
    render(<Harness radius={80} strength={0.5} />);
    const cursor = screen.getByTestId('cursor');
    mockBox('a', { left: 100, top: 100, width: 80, height: 40 }); // center (140,120)
    mockPoint('b', 5000, 5000);
    mockPoint('c', 5000, 5000);

    move(160, 120); // inside -> edge distance 0 -> factor = strength

    // x = 160 + (140-160)*0.5 = 150
    expect(cssVar(cursor, '--mc-x')).toBe('150px');
    expect(cursor).toHaveAttribute('data-pulling', 'true');
  });

  it('locks onto the nearest target when several are in range', () => {
    render(<Harness radius={80} strength={0.5} />);
    const cursor = screen.getByTestId('cursor');
    // Pointer at (100,0). DOM order A,B,C.
    mockPoint('a', 170, 0); // dist 70  -> first, sets best
    mockPoint('b', 140, 0); // dist 40  -> nearer, replaces
    mockPoint('c', 155, 0); // dist 55  -> in range but farther, kept out

    move(100, 0);

    // Pulled toward B (140): factor = 0.5*(1-40/80)=0.25 -> 100 + 40*0.25 = 110
    expect(cssVar(cursor, '--mc-x')).toBe('110px');
    expect(cssVar(cursor, '--mc-y')).toBe('0px');
    expect(cursor).toHaveAttribute('data-pulling', 'true');
  });

  it('releases the pull when the pointer leaves every radius', () => {
    render(<Harness radius={80} strength={0.5} />);
    const cursor = screen.getByTestId('cursor');
    mockBox('a', { left: 100, top: 100, width: 80, height: 40 });
    mockPoint('b', 5000, 5000);
    mockPoint('c', 5000, 5000);

    move(220, 120);
    expect(cursor).toHaveAttribute('data-pulling', 'true');

    move(900, 900);
    expect(cursor).toHaveAttribute('data-pulling', 'false');
    expect(cssVar(cursor, '--mc-x')).toBe('900px');
  });

  it('hides again when the pointer leaves the document', () => {
    render(<Harness />);
    const cursor = screen.getByTestId('cursor');
    mockPoint('a', 5000, 5000);
    mockPoint('b', 5000, 5000);
    mockPoint('c', 5000, 5000);

    move(50, 50);
    expect(cursor).toHaveAttribute('data-visible', 'true');
    expect(cursor.style.opacity).toBe('1');

    leaveDocument();
    expect(cursor).toHaveAttribute('data-visible', 'false');
    expect(cursor.style.opacity).toBe('0');
  });

  it('does nothing when disabled', () => {
    render(<Harness disabled />);
    const cursor = screen.getByTestId('cursor');
    expect(cursor).toHaveAttribute('data-active', 'false');
    expect(cursor.style.opacity).toBe('0');

    move(120, 120);
    expect(cssVar(cursor, '--mc-x')).toBe('');
    expect(cursor).toHaveAttribute('data-visible', 'false');
  });

  it('switches off under reduced motion by default', () => {
    setReducedMotion(true);
    render(<Harness />);
    const cursor = screen.getByTestId('cursor');
    expect(cursor).toHaveAttribute('data-active', 'false');

    move(120, 120);
    expect(cssVar(cursor, '--mc-x')).toBe('');
  });

  it('keeps tracking when respectReducedMotion is false', () => {
    setReducedMotion(true);
    render(<Harness respectReducedMotion={false} />);
    const cursor = screen.getByTestId('cursor');
    expect(cursor).toHaveAttribute('data-active', 'true');

    mockPoint('a', 5000, 5000);
    mockPoint('b', 5000, 5000);
    mockPoint('c', 5000, 5000);
    move(33, 44);
    expect(cssVar(cursor, '--mc-x')).toBe('33px');
  });

  it('hides the native cursor when asked and restores it on unmount', () => {
    document.body.style.cursor = 'auto';
    const { unmount } = render(<Harness hideNativeCursor />);
    expect(document.body.style.cursor).toBe('none');

    unmount();
    expect(document.body.style.cursor).toBe('auto');
  });

  it('leaves the native cursor alone by default', () => {
    document.body.style.cursor = 'auto';
    render(<Harness />);
    expect(document.body.style.cursor).toBe('auto');
  });
});
